import { getGlobalAdapter } from '@cowprotocol/sdk-common'

export const ACROSS_DEPOSIT_EVENT_INTERFACE = () => {
  return getGlobalAdapter().utils.createInterface([
    'event FundsDeposited(bytes32 inputToken, bytes32 outputToken, uint256 inputAmount, uint256 outputAmount, uint256 indexed destinationChainId, uint256 indexed depositId, uint32 quoteTimestamp, uint32 fillDeadline, uint32 exclusivityDeadline, bytes32 indexed depositor, bytes32 recipient, bytes32 exclusiveRelayer, bytes message)',
  ])
}

export const COW_TRADE_EVENT_INTERFACE = () => {
  return getGlobalAdapter().utils.createInterface([
    'event Trade(address owner, address sellToken, address buyToken, uint256 sellAmount, uint256 buyAmount, uint256 feeAmount, bytes orderUid)',
  ])
}
