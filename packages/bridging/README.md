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

const quoteResult = await bridgingSdk.getQuote(parameters)
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
    totalTimeout: 15000,        // 15 seconds total timeout
    providerTimeout: 8000, // 8 seconds per provider timeout
  }
}

// Get quotes from all providers
const results = await bridgingSdk.getMultiQuotes(multiQuoteRequest)

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
    totalTimeout: 20000,       // 20 seconds total timeout
    providerTimeout: 5000 // 5 seconds per provider timeout
  }
}

// This will return all results once completed (or timed out)
const finalResults = await bridgingSdk.getMultiQuotes(multiQuoteRequest)

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
    const results = await bridgingSdk.getMultiQuotes({
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
        totalTimeout: 30000,       // 30 seconds total timeout
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
const results = await bridgingSdk.getMultiQuotes({
  quoteBridgeRequest: parameters,
  options: {
    // Global timeout: Maximum time to wait for all providers to complete
    totalTimeout: 30000,        // 30 seconds (default)

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
- `totalTimeout`: The total time to wait for all providers. After this time, any remaining providers are marked as timed out.
- Providers that complete within their individual timeout but after the global timeout will still be included in the final results.

## Best Quote Selection

The `getBestQuote()` method provides an optimized way to get only the best quote from multiple providers, with progressive updates as better quotes are found. This is perfect for applications that only need the single best result.

### Basic Best Quote Usage

```typescript
import { MultiQuoteRequest } from '@cowprotocol/sdk-bridging'

// Get the best quote from all available providers
const bestQuote = await bridgingSdk.getBestQuote({
  quoteBridgeRequest: parameters, // Same parameters as above
  providerDappIds: ['provider1', 'provider2'], // Optional: specify which providers to query
  advancedSettings: {
    slippageBps: 100, // 1% slippage tolerance
  },
  options: {
    totalTimeout: 15000,       // 15 seconds total timeout
    providerTimeout: 8000,     // 8 seconds per provider timeout
  }
})

if (bestQuote?.quote) {
  console.log(`Best quote from ${bestQuote.providerDappId}:`, bestQuote.quote)
  const { buyAmount } = bestQuote.quote.bridge.amountsAndCosts.afterSlippage
  console.log(`You will receive: ${buyAmount} tokens`)
} else if (bestQuote?.error) {
  console.log('All providers failed, first error:', bestQuote.error.message)
} else {
  console.log('No quotes available')
}
```

### Progressive Best Quote Updates

For real-time updates, you can receive notifications each time a better quote is found:

```typescript
let currentBest: MultiQuoteResult | null = null

const bestQuote = await bridgingSdk.getBestQuote({
  quoteBridgeRequest: parameters,
  options: {
    // Called whenever a better quote is found
    onQuoteResult: (result) => {
      currentBest = result
      console.log(`🚀 New best quote from ${result.providerDappId}!`)

      if (result.quote) {
        const buyAmount = result.quote.bridge.amountsAndCosts.afterSlippage.buyAmount
        console.log(`Better quote found: ${buyAmount} tokens`)

        // Update UI immediately with the new best quote
        updateBestQuoteInUI(result)
      }
    },
    totalTimeout: 20000,      // 20 seconds total timeout
    providerTimeout: 5000     // 5 seconds per provider timeout
  }
})

console.log('Final best quote:', bestQuote)
```

### Error Handling with Best Quote

When all providers fail, `getBestQuote()` returns the first provider's error:

```typescript
const bestQuote = await bridgingSdk.getBestQuote({
  quoteBridgeRequest: parameters,
  options: {
    onQuoteResult: (result) => {
      // Only called for successful quotes that are better than current best
      console.log(`✅ Better quote from ${result.providerDappId}`)
    }
  }
})

if (bestQuote?.quote) {
  // Success: we have the best available quote
  console.log('Best quote found:', bestQuote.quote)
} else if (bestQuote?.error) {
  // All providers failed, this is the first error encountered
  console.error('All providers failed:', bestQuote.error.message)
  console.log('Failed provider:', bestQuote.providerDappId)
} else {
  // This should never happen, but good to handle
  console.log('No quote or error returned')
}
```

### Comparison: getBestQuote vs getMultiQuotes

| Feature | `getBestQuote()` | `getMultiQuotes()` |
|---------|------------------|-------------------|
| **Returns** | Single best result | Array of all results |
| **Progressive Callbacks** | Only for better quotes | For all results (success & error) |
| **Error Handling** | Returns first error if all fail | Returns all errors in array |
| **Performance** | Optimized for best result only | Returns complete data set |
| **Use Case** | When you only need the best quote | When you need to compare all options |

Choose `getBestQuote()` when:
- You only need the single best quote
- You want real-time updates as better quotes are found
- You want to minimize callback overhead (only called for improvements)

Choose `getMultiQuotes()` when:
- You need to display all available options to users
- You want to analyze all provider responses
- You need to show provider-specific errors or statuses

## Provider Management

The BridgingSdk provides methods to manage which bridge providers are actively used for quotes and operations.

### Getting Available Providers

Use `getAvailableProviders()` to retrieve the list of currently active providers:

```typescript
// Get all active providers
const providers = bridgingSdk.getAvailableProviders()

providers.forEach((provider) => {
  console.log(`Provider: ${provider.info.name}`)
  console.log(`Dapp ID: ${provider.info.dappId}`)
  console.log(`Networks: ${provider.info.supportedChains.join(', ')}`)
})
```

### Filtering Active Providers

Use `setAvailableProviders()` to dynamically filter which providers should be used for bridge operations:

```typescript
// Initially, all configured providers are available
const allProviders = bridgingSdk.getAvailableProviders()
console.log(`Total providers: ${allProviders.length}`)

// Filter to use only specific providers
bridgingSdk.setAvailableProviders(['across', 'hop-protocol'])

// Now only the specified providers will be used
const filteredProviders = bridgingSdk.getAvailableProviders()
console.log(`Active providers: ${filteredProviders.length}`)

// Reset to use all providers again
bridgingSdk.setAvailableProviders([])
const resetProviders = bridgingSdk.getAvailableProviders()
console.log(`Reset to all providers: ${resetProviders.length}`)
```

### Dynamic Provider Selection Example

```typescript
// Example: Let users select their preferred bridge providers
const [selectedProviders, setSelectedProviders] = useState<string[]>([])

// Function to update active providers based on user selection
const updateActiveProviders = (providerIds: string[]) => {
  bridgingSdk.setAvailableProviders(providerIds)
  setSelectedProviders(providerIds)

  console.log(`Updated to use ${providerIds.length} provider(s)`)
}

// Get quotes only from selected providers
const getQuotesFromSelectedProviders = async () => {
  // The SDK will automatically use only the providers set via setAvailableProviders
  const quote = await bridgingSdk.getQuote(parameters)
  // Or for multi-provider quotes
  const multiQuotes = await bridgingSdk.getMultiQuotes({
    quoteBridgeRequest: parameters
    // No need to specify providerDappIds, setAvailableProviders already filtered them
  })

  return quote
}
```

## Supported Bridge Providers

- Additional bridge providers are being integrated
- More details will be available as development progresses
