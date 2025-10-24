<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# Flash Loans SDK

Execute flash loan-based collateral swaps using Aave Protocol V3 integrated with CoW Protocol for optimal trading execution.

This SDK facilitates complex flash loan operations where you can:
- Borrow assets via Aave flash loans
- Swap collateral using CoW Protocol's intent-based trading
- Repay flash loans automatically with optimized execution
- Use CoW Protocol hooks to manage the entire flow

## How It Works

1. 💸 Borrow tokens via Aave flash loan
2. 🔄 Execute a CoW Protocol swap to desired collateral
3. ⚙️ Use CoW hooks to deploy adapter contracts and manage the swap
4. ✅ Automatically repay the flash loan with fees

The order is signed using EIP-1271 with a deterministically generated smart contract address as the signer.

## Why Use Flash Loans?

- **Capital Efficiency** - No upfront capital required to swap collateral
- **Atomic Execution** - The entire operation succeeds or reverts atomically
- **Gas Optimization** - Single transaction for complex multi-step operations
- **Aave Integration** - Leverage Aave V3's flash loan infrastructure
- **CoW Protocol Benefits** - MEV protection and optimal execution via batch auctions

## Installation

```bash
npm install @cowprotocol/sdk-flash-loans
# or
pnpm add @cowprotocol/sdk-flash-loans
# or
yarn add @cowprotocol/sdk-flash-loans
```

You'll also need the trading SDK:
```bash
npm install @cowprotocol/sdk-trading
```

## Setup

You need:
- `chainId` - Supported chain ID (see [SDK config](https://docs.cow.fi/cow-protocol/reference/sdks/core-utilities/sdk-config))
- `appCode` - Unique app identifier for tracking orders
- `signer` - Private key, ethers signer, or `Eip1193` provider
- `TradingSdk` instance - For getting quotes and posting orders

## Usage

### Basic Collateral Swap

```typescript
import { AaveCollateralSwapSdk } from '@cowprotocol/sdk-flash-loans'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { createPublicClient, http, privateKeyToAccount } from 'viem'
import { gnosis } from 'viem/chains'

// Set up adapter
const adapter = new ViemAdapter({
  provider: createPublicClient({
    chain: gnosis,
    transport: http('YOUR_RPC_URL')
  }),
  signer: privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
})

// Initialize the Trading SDK
const tradingSdk = new TradingSdk(
  {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    appCode: 'aave-v3-flashloan',
  },
  {},
  adapter
)

// Initialize the Flash Loan SDK
const flashLoanSdk = new AaveCollateralSwapSdk()

// Execute collateral swap
const result = await flashLoanSdk.collateralSwap(
  {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    tradeParameters: {
      sellToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI
      sellTokenDecimals: 18,
      buyToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
      buyTokenDecimals: 6,
      amount: '20000000000000000000', // 20 WXDAI
      kind: OrderKind.SELL,
      validFor: 600, // 10 minutes
      slippageBps: 50, // 0.5% slippage
    },
    collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533', // aGnoWXDAI (Aave interest-bearing WXDAI)
    flashLoanFeePercent: 0.05, // 0.05% flash loan fee
  },
  tradingSdk
)

console.log('Flash loan order created:', result.orderId)
```

### Advanced Usage with Quote Review

For maximum control over the process, including manual approval management:

```typescript
import { AaveCollateralSwapSdk } from '@cowprotocol/sdk-flash-loans'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'

const flashLoanSdk = new AaveCollateralSwapSdk()

const collateralToken = '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533' // aGnoWXDAI

// Step 1: Prepare quote parameters
const params = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  tradeParameters: {
    sellToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    sellTokenDecimals: 18,
    buyToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0',
    buyTokenDecimals: 6,
    amount: '20000000000000000000',
    kind: OrderKind.SELL,
  },
  collateralToken,
  flashLoanFeePercent: 0.05,
}

const quoteParams = await flashLoanSdk.getSwapQuoteParams(params)

// Step 2: Get quote
const quoteAndPost = await tradingSdk.getQuote(quoteParams)
const { quoteResults } = quoteAndPost

// Step 3: Review the quote
const buyAmount = quoteResults.amountsAndCosts.afterSlippage.buyAmount
console.log(`You will receive at least: ${buyAmount} tokens`)

// Step 4: Generate order settings and get instance address
const { swapSettings, instanceAddress } = await flashLoanSdk.getOrderPostingSettings(
  params,
  quoteParams,
  quoteResults
)

// Step 5: Check collateral allowance
const sellAmount = BigInt(params.tradeParameters.amount)
const allowance = await flashLoanSdk.getCollateralAllowance({
  trader: quoteParams.owner,
  collateralToken,
  amount: sellAmount,
  instanceAddress,
})

console.log(`Current allowance: ${allowance.toString()}`)
console.log(`Required amount: ${sellAmount.toString()}`)

// Step 6: Approve collateral if needed
if (allowance < sellAmount) {
  console.log('Insufficient allowance, approving...')
  const txResponse = await flashLoanSdk.approveCollateral({
    trader: quoteParams.owner,
    collateralToken,
    amount: sellAmount,
    instanceAddress,
  })
  console.log('Approval transaction:', txResponse.hash)
  // Optionally wait for confirmation here
} else {
  console.log('Sufficient allowance already exists')
}

// Step 7: Post the order
const result = await quoteAndPost.postSwapOrderFromQuote(swapSettings)
console.log('Order posted:', result.orderId)
```

## Flash Loan Fee

Aave flash loans typically charge a fee (currently 0.05% on most assets). This fee is:
- Deducted from the sell amount before getting the quote
- Ensures the swap proceeds cover both the desired output and flash loan repayment
- Configurable via `flashLoanFeePercent` parameter

**Example:**
```typescript
// With 0.05% flash loan fee on 20 WXDAI:
// - Flash loan: 20 WXDAI
// - Fee: 0.01 WXDAI (0.05% of 20)
// - Actual swap amount: 19.99 WXDAI
{
  amount: '20000000000000000000',
  flashLoanFeePercent: 0.05, // 0.05%
}
```

## Collateral Token Parameter

The `collateralToken` parameter specifies which Aave interest-bearing token (aToken) will be used as collateral for the flash loan operation.

### What are aTokens?

When you deposit assets into Aave, you receive aTokens (e.g., aWXDAI, aUSDC) that:
- Represent your deposited collateral
- Accrue interest automatically
- Can be used for flash loan collateral swaps
- Need approval for the flash loan adapter to spend

### Common aTokens on Gnosis Chain

```typescript
const AAVE_TOKENS = {
  aGnoWXDAI: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533', // Aave WXDAI
  aGnoUSDC: '0xc6B7AcA6DE8a6044E0e32d0c841a89244A10D284',  // Aave USDC
  // Add more as needed
}
```

### Usage Example

```typescript
const result = await flashLoanSdk.collateralSwap(
  {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    tradeParameters: {
      sellToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI (what we're swapping)
      buyToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0',  // USDC.e (what we want)
      amount: '20000000000000000000',
      kind: OrderKind.SELL,
    },
    collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533', // aGnoWXDAI (our Aave collateral)
    flashLoanFeePercent: 0.05,
  },
  tradingSdk
)
```

**Important Notes:**
- The `collateralToken` must be an Aave aToken address
- You must have sufficient aToken balance for collateral
- The SDK automatically handles approval of this token
- This is different from `sellToken` (which is the underlying asset being swapped)

## Collateral Token Approval

Before executing a collateral swap, the flash loan adapter needs approval to spend your collateral tokens. The SDK handles this automatically but also provides methods for manual control.

### Automatic Approval

By default, `collateralSwap()` automatically checks and approves collateral if needed:

```typescript
// Automatic approval happens here
const result = await flashLoanSdk.collateralSwap(
  {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    tradeParameters: { /* ... */ },
    collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533', // aGnoWXDAI
  },
  tradingSdk
)
```

### Manual Approval with getCollateralAllowance and approveCollateral

For more control over the approval process:

```typescript
// Step 1: Get the adapter instance address
const quoteParams = await flashLoanSdk.getSwapQuoteParams(params)
const quoteAndPost = await tradingSdk.getQuote(quoteParams)
const { swapSettings, instanceAddress } = await flashLoanSdk.getOrderPostingSettings(
  params,
  quoteParams,
  quoteAndPost.quoteResults
)
const sellAmount = BigInt(params.tradeParameters.amount)

// Step 2: Check current allowance
const allowance = await flashLoanSdk.getCollateralAllowance({
  trader: quoteParams.owner,
  collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533',
  amount: sellAmount,
  instanceAddress,
})

console.log('Current allowance:', allowance.toString())

// Step 3: Approve if needed
if (allowance < sellAmount) {
  const txResponse = await flashLoanSdk.approveCollateral({
    trader: quoteParams.owner,
    collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533',
    amount: sellAmount,
    instanceAddress,
  })
  console.log('Approval transaction:', txResponse.hash)
  // Wait for confirmation...
}

// Step 4: Execute swap with approval prevention
const result = await flashLoanSdk.collateralSwap(
  {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    tradeParameters: { /* ... */ },
    collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533',
    settings: {
      preventApproval: true, // Skip automatic approval
    },
  },
  tradingSdk
)
```

### Gasless Approval with EIP-2612 Permit

For tokens that support EIP-2612, you can use permit for gasless approval:

```typescript
// Generate permit signature (implementation varies by wallet)
const collateralPermit = {
  amount: 0,
  deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  v: 27,
  r: '0x...',
  s: '0x...',
}

const result = await flashLoanSdk.collateralSwap(
  {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    tradeParameters: { /* ... */ },
    collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533',
    settings: {
      collateralPermit, // Use permit instead of approve
    },
  },
  tradingSdk
)
```

## How Hooks Work

The SDK uses CoW Protocol hooks to orchestrate the flash loan:

### Pre-Hook
- Deploys the Aave adapter contract deterministically
- Transfers the flash loan to the adapter
- Sets up the swap parameters

### Post-Hook
- Executes the collateral swap via the adapter
- Repays the Aave flash loan with fees
- Transfers remaining tokens to the owner

All hooks are automatically configured and gas estimated by the SDK.

## Error Handling

Common errors and solutions:

**Insufficient flash loan amount**
```typescript
// Error: Flash loan amount doesn't cover fee + swap
// Solution: Increase amount or adjust flash loan fee
{
  amount: '20000000000000000000', // Increase this
  flashLoanFeePercent: 0.05,
}
```

**Slippage too tight**
```typescript
// Error: Slippage tolerance too low for current market conditions
// Solution: Increase slippageBps
{
  slippageBps: 100, // Increase from 50 to 100 (1%)
}
```

**Order expired**
```typescript
// Error: Order validity period too short
// Solution: Increase validFor
{
  validFor: 1200, // 20 minutes instead of 10
}
```

## Advanced Topics

### EIP-1271 Signatures

Flash loan orders use EIP-1271 signature verification with a deterministically generated smart contract address. This enables:
- Gasless order creation
- Deterministic contract deployment
- Secure flash loan execution

### Gas Optimization

The SDK automatically:
- Estimates gas for hook execution
- Uses fallback gas limits if estimation fails
- Optimizes hook call data encoding

### Adapter Contracts

Adapter contracts are:
- Deployed deterministically using CREATE2
- Reusable across multiple flash loan operations
- Managed automatically by the SDK

## Limitations

- Only supports Aave V3 flash loans
- Requires sufficient liquidity in Aave pools
- Flash loan fees apply (typically 0.05%)
- Subject to CoW Protocol order limits
- Network-specific contract deployments required

## Security Considerations

- Always review quotes before execution
- Set appropriate slippage tolerances
- Verify token addresses and decimals
- Test with small amounts first
- Monitor transaction execution
- Be aware of flash loan fees and costs

## Resources

- [Aave Flash Loans Documentation](https://docs.aave.com/developers/guides/flash-loans)
- [CoW Protocol Documentation](https://docs.cow.fi/)
- [CoW Protocol Hooks](https://docs.cow.fi/cow-protocol/reference/core/intents/hooks)
- [EIP-1271 Specification](https://eips.ethereum.org/EIPS/eip-1271)
