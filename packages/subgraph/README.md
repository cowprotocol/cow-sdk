<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Subgraph

This package provides a TypeScript client for querying CoW Protocol data from TheGraph subgraphs. It offers a simple and type-safe way to access historical trading data, volume statistics, and other protocol metrics across multiple chains.

## What's included

- **SubgraphApi Client** - Main client for querying CoW Protocol subgraphs
- **Pre-built Queries** - Common queries for totals, volume, and statistics
- **Multi-chain Support** - Support for Ethereum, Gnosis Chain, Arbitrum, Base, and Sepolia
- **Type-safe Responses** - Fully typed GraphQL responses
- **Custom Query Support** - Run any GraphQL query with full type safety

## Installation

```bash
npm install @cowprotocol/sdk-subgraph
or
pnpm add @cowprotocol/sdk-subgraph
or
yarn add @cowprotocol/sdk-subgraph
```

## Usage

### Basic Setup

You'll need a Graph API key from TheGraph. Get one at [TheGraph Studio](https://thegraph.com/studio/apikeys/).

```typescript
import { SubgraphApi } from '@cowprotocol/sdk-subgraph'
import { SupportedChainId } from '@cowprotocol/sdk-config'

// Initialize with your API key
const subgraphApi = new SubgraphApi('YOUR_GRAPH_API_KEY')

// Optionally configure for specific chain
const mainnetApi = new SubgraphApi('YOUR_GRAPH_API_KEY', {
  chainId: SupportedChainId.MAINNET,
})
```

### Query Protocol Totals

Get overall protocol statistics including tokens, orders, traders, settlements, volume, and fees.

```typescript
import { SubgraphApi } from '@cowprotocol/sdk-subgraph'

const subgraphApi = new SubgraphApi('YOUR_GRAPH_API_KEY')

// Get protocol totals
const totals = await subgraphApi.getTotals()
console.log('Total tokens:', totals.tokens)
console.log('Total orders:', totals.orders)
console.log('Total volume USD:', totals.volumeUsd)
console.log('Total fees USD:', totals.feesUsd)
```

### Query Volume Data

Get historical volume data for specific time periods.

```typescript
// Get volume for last 7 days
const last7DaysVolume = await subgraphApi.getLastDaysVolume(7)
console.log('Daily volumes:', last7DaysVolume.dailyTotals)

// Get volume for last 24 hours
const last24HoursVolume = await subgraphApi.getLastHoursVolume(24)
console.log('Hourly volumes:', last24HoursVolume.hourlyTotals)
```

### Custom Queries

Run any GraphQL query with full type safety.

```typescript
import { gql } from 'graphql-request'

// Custom query for top tokens by volume
const query = gql`
  query TokensByVolume {
    tokens(first: 5, orderBy: totalVolumeUsd, orderDirection: desc) {
      address
      symbol
      totalVolumeUsd
      priceUsd
    }
  }
`

const result = await subgraphApi.runQuery(query)
console.log('Top tokens:', result.tokens)
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Test Configuration

The tests use `jest-fetch-mock` to mock GraphQL responses. No private key is required for testing as all API calls are mocked.

```typescript
// Example test structure
import { SubgraphApi } from '@cowprotocol/sdk-subgraph'
import fetchMock from 'jest-fetch-mock'

describe('SubgraphApi', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  test('should get totals', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        data: {
          totals: [
            {
              tokens: '192',
              orders: '365210',
              volumeUsd: '49548634.23',
            },
          ],
        },
      }),
    )

    const api = new SubgraphApi('FakeApiKey')
    const totals = await api.getTotals()

    expect(totals.tokens).toBe('192')
  })
})
```

## API Key Requirements

To use this package, you need a Graph API key from TheGraph:

1. Go to [TheGraph Studio](https://thegraph.com/studio/apikeys/)
2. Create a new API key
3. Use the API key when initializing the SubgraphApi

```typescript
const subgraphApi = new SubgraphApi('your-api-key-here')
```

> **Note:** The API key is required for all subgraph queries. Make sure to keep your API key secure and never expose it in client-side code.
