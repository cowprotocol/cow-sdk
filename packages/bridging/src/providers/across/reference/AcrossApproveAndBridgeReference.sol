// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

/**
 * Reference/example only.
 *
 * This file is intentionally verbose and heavily commented so teams can align on
 * how to bridge the full CoWShed runtime balance through Across.
 *
 * It is inspired by CoW's ApproveAndBridge pattern:
 * https://github.com/cowprotocol/approve-and-bridge/blob/main/src/mixin/ApproveAndBridge.sol
 *
 * IMPORTANT:
 * - This is NOT production ready.
 * - Security review, chain-by-chain config, and final interface hardening are still required.
 * - This file is designed as implementation guidance for "what to deploy".
 */

interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
}

interface IAcrossSpokePoolPeripheryLike {
    /**
     * NOTE:
     * We deliberately avoid importing the full Across struct/interface here in
     * this reference. Instead, we call using pre-encoded calldata.
     *
     * This keeps the example simple and lets the SDK own ABI encoding.
     */
}

/**
 * @title AcrossApproveAndBridgeReference
 * @notice Delegatecall target for CoWShed hooks that bridges FULL runtime balance via Across.
 *
 * High-level flow (called via delegatecall from CoWShed proxy):
 * 1) Read token balance of `address(this)` (this is the CoWShed proxy context).
 * 2) Ensure balance >= `minAmount` (quoted min input / max-slippage output from swap leg).
 * 3) Patch `swapTokenAmount` inside pre-encoded periphery calldata to runtime balance.
 * 4) Approve Across SpokePoolPeriphery for runtime balance.
 * 5) Call Across SpokePoolPeriphery.swapAndBridge(...) using patched calldata
 *    where:
 *    - minExpectedInputTokenAmount = minAmount
 *    - enableProportionalAdjustment = true
 *    - swapTokenAmount is runtime exact amount (patched on-chain)
 * 6) Across SwapProxy returns full balance into periphery swap path; periphery checks
 *    minExpectedInputTokenAmount and scales destination output proportionally on surplus.
 */
contract AcrossApproveAndBridgeReference {
    error MinAmountNotMet(uint256 available, uint256 minAmount);
    error InvalidToken();
    error InvalidCalldataLength();
    error InvalidSwapTokenAmountOffset(uint256 offset);
    error ApprovalFailed();
    error AcrossCallFailed(bytes returnData);

    struct AcrossBridgeRuntimeData {
        // Across periphery contract on source chain
        address periphery;
        // Pre-encoded calldata for periphery.swapAndBridge(...)
        bytes peripherySwapAndBridgeCalldata;
        // Byte offset (from calldata start, including 4-byte selector) of swapTokenAmount word.
        uint256 swapTokenAmountOffset;
    }

    /**
     * @notice Main entrypoint to be delegatecalled by CoWShed.
     *
     * @param token The intermediate token being bridged (ERC20 only in this reference).
     * @param minAmount Minimum amount required. Must match quoted min input that was used
     *                  for Across suggested fees / swap approval.
     * @param nativeTokenExtraFee Reserved for parity with generic wrappers (unused for
     *                            this ERC20 example; should be 0 for Across ERC20 path).
     * @param data ABI-encoded `AcrossBridgeRuntimeData`.
     */
    function approveAndBridge(
        IERC20Minimal token,
        uint256 minAmount,
        uint256 nativeTokenExtraFee,
        bytes calldata data
    ) external {
        // STEP 1: Validate assumptions for this reference.
        // TODO: add native-token support path if required in the future.
        if (address(token) == address(0)) revert InvalidToken();
        if (nativeTokenExtraFee != 0) revert InvalidToken();

        // STEP 2: Read full runtime balance from CoWShed context.
        uint256 balance = token.balanceOf(address(this));

        // STEP 3: Enforce quoted minimum safety bound.
        if (balance < minAmount) revert MinAmountNotMet(balance, minAmount);

        // STEP 4: Decode runtime routing payload.
        AcrossBridgeRuntimeData memory runtime = abi.decode(data, (AcrossBridgeRuntimeData));

        // STEP 5: Patch swapTokenAmount at known offset to runtime exact balance.
        _writeWordAtOffsetInEncodedCalldata(runtime.peripherySwapAndBridgeCalldata, runtime.swapTokenAmountOffset, balance);

        // STEP 6: Approve periphery to pull the runtime amount from CoWShed context.
        // We reset to zero first for broader ERC20 compatibility.
        if (!token.approve(runtime.periphery, 0)) revert ApprovalFailed();
        if (!token.approve(runtime.periphery, balance)) revert ApprovalFailed();

        // STEP 7: Call periphery.swapAndBridge(...) with patched calldata.
        //
        // The SDK should encode `runtime.peripherySwapAndBridgeCalldata` with:
        // - minExpectedInputTokenAmount = minAmount
        // - enableProportionalAdjustment = true
        // - swapTokenAmount = any non-zero placeholder/visible value;
        //   this contract overwrites it with runtime `balance` at provided offset.
        //
        // TODO: optionally decode and assert these fields on-chain to prevent malformed calldata:
        (bool success, bytes memory ret) = runtime.periphery.call(runtime.peripherySwapAndBridgeCalldata);
        if (!success) revert AcrossCallFailed(ret);
    }

    /// @dev Writes one 32-byte ABI word at `offset` in encoded calldata.
    function _writeWordAtOffsetInEncodedCalldata(bytes memory encodedCalldata, uint256 offset, uint256 value)
        internal
        pure
    {
        if (encodedCalldata.length < 4 + 32) revert InvalidCalldataLength();
        if (offset < 4) revert InvalidSwapTokenAmountOffset(offset);
        if ((offset - 4) % 32 != 0) revert InvalidSwapTokenAmountOffset(offset);
        if (offset + 32 > encodedCalldata.length) revert InvalidSwapTokenAmountOffset(offset);

        assembly {
            mstore(add(add(encodedCalldata, 0x20), offset), value)
        }
    }
}

