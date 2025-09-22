<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Bridging

This package provides bridging functionality for the CoW Protocol SDK, enabling cross-chain token transfers and interactions. It integrates with various bridge providers to facilitate seamless asset movement across supported blockchain networks.

## Installation

```bash
npm install @cowprotocol/sdk-bridging
or
pnpm add @cowprotocol/sdk-bridging
or
yarn add @cowprotocol/sdk-bridging
```

## Usage

### Individual package usage

```typescript
import {
  SupportedChainId,
  BridgingSdk,
  QuoteBridgeRequest,
  OrderKind,
  assertIsBridgeQuoteAndPost,
} from '@cowprotocol/sdk-bridging'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Initialize bridging SDK
const bridging = new BridgingSdk(adapter, options)

const parameters: QuoteBridgeRequest = {
  // Cross-chain orders are always SELL orders (BUY not supported yet)
  kind: OrderKind.SELL,

  // Sell token (and source chain)
  sellTokenChainId: SupportedChainId.ARBITRUM_ONE,
  sellTokenAddress: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,

  // Buy token (and target chain)
  buyTokenChainId: SupportedChainId.BASE,
  buyTokenAddress: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,

  // Amount to sell
  amount: '120000000000000000',

  signer: adapter.signer,

  // Optional parameters
  appCode: 'YOUR_APP_CODE',
}

// Get a quote (and the post callback) for a cross-chain swap
const quoteResult = await sdk.getQuote(parameters)
// Assert that the quote result is of type BridgeQuoteAndPost
// (type for cross-chain quotes, as opposed to QuoteAndPost for single-chain quotes).
// The assertion makes typescript happy.
assertIsBridgeQuoteAndPost(quoteResult)
const { swap, bridge, postSwapOrderFromQuote } = quoteResult

// Display all data related to the swap (costs, amounts, appData including the bridging hook, etc.) 🐮
console.log('Swap info', swap)

// Display all data related to the bridge (costs, amounts, provider info, hook, and the bridging quote) ✉️
console.log('Bridge info', bridge)

// Get the buy amount after slippage in the target chain
const { buyAmount } = bridge.amountsAndCosts.afterSlippage

if (confirm(`You will get at least: ${buyAmount}, ok?`)) {
  const orderId = await postSwapOrderFromQuote()
  console.log('Order created, id: ', orderId)
}
```

### Usage with CoW SDK

```typescript
import {
  CowSdk,
  SupportedChainId,
  QuoteBridgeRequest,
  OrderKind,
  assertIsBridgeQuoteAndPost,
} from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Initialize the unified SDK
const sdk = new CowSdk({
  chainId: SupportedChainId.ARBITRUM_ONE, // Source chain
  adapter,
})

const parameters: QuoteBridgeRequest = {
  // Cross-chain orders are always SELL orders (BUY not supported yet)
  kind: OrderKind.SELL,

  // Sell token (and source chain)
  sellTokenChainId: SupportedChainId.ARBITRUM_ONE,
  sellTokenAddress: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,

  // Buy token (and target chain)
  buyTokenChainId: SupportedChainId.BASE,
  buyTokenAddress: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,

  // Amount to sell
  amount: '120000000000000000',

  signer: adapter.signer,

  // Optional parameters
  appCode: 'YOUR_APP_CODE',
}

const quoteResult = await sdk.bridging.getQuote(parameters)
assertIsBridgeQuoteAndPost(quoteResult)
const { swap, bridge, postSwapOrderFromQuote } = quoteResult

// Display all data related to the swap and bridge
console.log('Swap info', swap)
console.log('Bridge info', bridge)

// Get the buy amount after slippage in the target chain
const { buyAmount } = bridge.amountsAndCosts.afterSlippage

if (confirm(`You will get at least: ${buyAmount}, ok?`)) {
  const orderId = await postSwapOrderFromQuote()
  console.log('Order created, id: ', orderId)
}
```

## Multi-Provider Quote Comparison

The `getMultiQuotes()` method allows you to get quotes from multiple bridge providers simultaneously, with support for progressive results as each provider responds.

### Basic Multi-Quote Usage

```typescript
import { MultiQuoteRequest } from '@cowprotocol/sdk-bridging'

const multiQuoteRequest: MultiQuoteRequest = {
  quoteBridgeRequest: parameters, // Same parameters as above
  providerDappIds: ['provider1', 'provider2'], // Optional: specify which providers to query
  advancedSettings: {
    slippageBps: 100, // 1% slippage tolerance
  },
  options: {
    timeout: 15000,        // 15 seconds total timeout
    providerTimeout: 8000, // 8 seconds per provider timeout
  }
}

// Get quotes from all providers
const results = await sdk.bridging.getMultiQuotes(multiQuoteRequest)

results.forEach((result) => {
  if (result.quote) {
    console.log(`Quote from ${result.providerDappId}:`, result.quote)
  } else {
    console.log(`Error from ${result.providerDappId}:`, result.error?.message)
  }
})
```

### Progressive Quote Results

For better user experience, you can receive quotes progressively as each provider responds:

```typescript
const progressiveResults: MultiQuoteResult[] = []

const multiQuoteRequest: MultiQuoteRequest = {
  quoteBridgeRequest: parameters,
  options: {
    // Receive quotes as they arrive
    onQuoteResult: (result) => {
      progressiveResults.push(result)

      if (result.quote) {
        console.log(`✅ Quote received from ${result.providerDappId}`)
        // Update UI immediately with the new quote
        displayQuoteInUI(result)
      } else {
        console.log(`❌ Error from ${result.providerDappId}: ${result.error?.message}`)
      }
    },
    timeout: 20000,       // 20 seconds total timeout
    providerTimeout: 5000 // 5 seconds per provider timeout
  }
}

// This will return all results once completed (or timed out)
const finalResults = await sdk.bridging.getMultiQuotes(multiQuoteRequest)

console.log(`Received ${finalResults.filter(r => r.quote).length} successful quotes out of ${finalResults.length} providers`)
```

### Advanced Multi-Quote Example

```typescript
// Example with React state management
const [quotes, setQuotes] = useState<MultiQuoteResult[]>([])
const [isLoading, setIsLoading] = useState(false)

const fetchQuotes = async () => {
  setIsLoading(true)
  setQuotes([])

  try {
    const results = await sdk.bridging.getMultiQuotes({
      quoteBridgeRequest: parameters,
      options: {
        onQuoteResult: (result) => {
          // Add quote to state as it arrives
          setQuotes(prev => [...prev, result])

          if (result.quote) {
            // Optional: Auto-select best quote
            if (isBestQuote(result)) {
              selectQuote(result)
            }
          } else {
            // Handle errors
            console.error(`Provider ${result.providerDappId} failed:`, result.error?.message)
            // Update UI to show provider is unavailable
            setProviderStatus(prev => ({
              ...prev,
              [result.providerDappId]: 'error'
            }))
          }
        },
        timeout: 30000,       // 30 seconds total timeout
        providerTimeout: 10000 // 10 seconds per provider timeout
      }
    })

    console.log('All quotes completed:', results)
  } catch (error) {
    console.error('Multi-quote failed:', error)
  } finally {
    setIsLoading(false)
  }
}

// Helper function to determine best quote
const isBestQuote = (result: MultiQuoteResult): boolean => {
  if (!result.quote) return false

  const currentBest = quotes.find(q => q.quote)
  if (!currentBest?.quote) return true

  // Compare buy amounts after slippage
  return result.quote.bridge.amountsAndCosts.afterSlippage.buyAmount >
         currentBest.quote.bridge.amountsAndCosts.afterSlippage.buyAmount
}
```

### Timeout Configuration

The `getMultiQuotes()` method supports two types of timeouts for fine-grained control:

```typescript
const results = await sdk.bridging.getMultiQuotes({
  quoteBridgeRequest: parameters,
  options: {
    // Global timeout: Maximum time to wait for all providers to complete
    timeout: 30000,        // 30 seconds (default)

    // Individual provider timeout: Maximum time each provider has to respond
    providerTimeout: 15000, // 15 seconds (default)

    onQuoteResult: (result) => {
      // Handle progressive results
      console.log(`Received result from ${result.providerDappId}`);
    }
  }
});
```

**How timeouts work:**
- `providerTimeout`: Each provider has this amount of time to complete their quote request. If exceeded, that provider returns a timeout error.
- `timeout`: The total time to wait for all providers. After this time, any remaining providers are marked as timed out.
- Providers that complete within their individual timeout but after the global timeout will still be included in the final results.

## Supported Bridge Providers

- Additional bridge providers are being integrated
- More details will be available as development progresses
