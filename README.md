<p align="center">
  <img width="400" src="https://raw.githubusercontent.com/cowprotocol/cow-sdk/main/docs/images/CoW.png">
</p>

# CoW protocol SDK

[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![Coverage Status](https://coveralls.io/repos/github/cowprotocol/cow-sdk/badge.svg?branch=main)](https://coveralls.io/github/cowprotocol/cow-sdk?branch=main)

## Getting started

Install the SDK:

```bash
yarn add @cowprotocol/cow-sdk
```

Instantiate the SDK:

```js
import { CowSdk } from '@cowprotocol/cow-sdk'

const chainId = 4 // Rinkeby
const cowSdk = new CowSdk(chainId)
```

The SDK will expose:
* The CoW API (`cowSdk.cowApi`)
* The CoW Subgraph (`cowSdk.cowSubgraphApi`)
* Convenient method to facilitate signing orders (i.e `cowSdk.signOrder`)


## CoW API
The SDK provides access to the CoW API.

For example, you can easily get the last 5 order of a trader:
```js
// i.e. Get last 5 orders for a given trader
const trades = await cowSdk.cowApi.getOrders({
  owner: '0x00000000005ef87f8ca7014309ece7260bbcdaeb', // Trader
  limit: 5,
  offset: 0,
})
console.log(trades)
```

## Sign and Post orders
In this example, we will:

- 1. **Instantiate the SDK and a wallet**: Used for signing orders
- 2. **Get a price/fee quote from the API**: Get current market price and required protocol fee to settle your trade.
- 3. **Sign the order using your wallet**: Only signed orders are considered by the protocol.
- 4. **Post the signed order to the API**: Post the order so it can be executed.


> ⚠️ Before starting, the protocol requires you to approve the sell token before the order can be considered.
> For more details see https://docs.cow.fi/tutorials/how-to-submit-orders-via-the-api/1.-set-allowance-for-the-sell-token


```js
import { Wallet } from 'ethers'
import { CowSdk, OrderKind } from '@cowprotocol/cow-sdk'

// 1. Instantiate wallet and SDK
const mnemonic = 'fall dirt bread cactus...'
const wallet = Wallet.fromMnemonic(mnemonic)
const cowSdk = new CowSdk(4, { signer: wallet }) // Leaving chainId empty will default to MAINNET

// 2. Get a price/fee quote from the API
//    It will return the price and fee to "Sell 1 ETH for USDC"
const quoteResponse = await cowSdk.cowApi.getQuote({
  kind: OrderKind.SELL, // Sell order (could also be BUY)
  sellToken: '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
  buyToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b', // USDC
  amount: '1000000000000000000', // 1 WETH
  userAddress: '0x1811be0994930fe9480eaede25165608b093ad7a', // Trader
  validTo: 2524608000,
})

const { sellToken, buyToken, validTo, buyAmount, sellAmount, receiver, feeAmount } = quoteResponse.quote
const order = {
  kind: OrderKind.SELL,
  partiallyFillable: false, // Allow partial executions of an order (true would be for a "Fill or Kill" order, which is not yet supported but will be added soon)
  sellToken,
  buyToken,
  validTo,
  buyAmount,
  sellAmount,
  receiver,
  feeAmount,
}

// 3. Sign the order using your wallet
const signedOrder = await cowSdk.signOrder(order)

// 4. Post the signed order to the API
const orderId = await cowSdk.cowApi.sendOrder({
  order: { ...order, ...signedOrder },
  owner: '0x1811be0994930fe9480eaede25165608b093ad7a',
})

// We can inspect the Order details in the CoW Protocol Explorer
console.log(`https://explorer.cow.fi/rinkeby/orders/${orderId}`)

// You can also override defaults params when using CowApi methods
const orderId = await cowSdk.cowApi.sendOrder(
  {
    order: { ...order, ...signedOrder },
    owner: '0x1811be0994930fe9480eaede25165608b093ad7a',
  },
  { chainId: 1, isDevEnvironment: false }
)
```


## Create a meta-data document for attaching into an order
Orders in CoW Protocol can contain arbitrary data in a field called `AppData`.

The SDK facilitates the creation of these documents, and getting the `AppData` Hex number that summarizes it.


The most important thing to define in the meta-data is the name of your app, so the order-flow can be credited to it.

```js
const appDataDoc = cowSdk.metadataApi.generateAppDataDoc({}, {
  appCode: 'YourApp'
})
```

This will create a document similar to:
```json
{
  "version": "0.1.0",
  "appCode": "YourApp",
  "metadata": {},
} 
```

After creating the most basic document, you can see how to attach additional meta-data items.

For example, you could give information about who reffered the user creating the order.

```js
const appDataDoc = cowSdk.metadataApi.generateAppDataDoc(
  {
    referrer: {
      address: '0x1f5B740436Fc5935622e92aa3b46818906F416E9',
      version: '0.1.0',
    },
  },
  {
    appCode: 'YourApp',
  }
)
```

This will create a document similar to:

```json
{
    "version": "0.1.0",
    "appCode": "YourApp",
    "metadata": {
      "referrer": {
        "address": "0x1f5B740436Fc5935622e92aa3b46818906F416E9",
        "version": "0.1.0",
      },
    },
}
```


For a complete list of meta-data that can be attach check [@cowprotocol/app-data](https://github.com/cowprotocol/app-data)


## Get the AppData Hex
The `AppData` Hex points to a IPFS document with the meta-data attached to the order.

You can calculate the `AppData` Hex, and its corresponding `cidV0` using the SDK:

```js
const { appDataHash, cidv0 } = await cowSdk.metadataApi.calculateAppDataHash(appDataDoc)
```

Note how this operation is deterministic, so given the same document, it will always generate the same hash. 

This method can be used to calculate the actual hash before posting the order, or even uploading the document to IPFS.


## Get meta-data document uploaded to IPFS from AppData
Given the `AppData` of a document that has been uploaded to IPFS, you can easily retrieve the document.

```js
const appDataDoc = await cowSdk.metadataApi.decodeAppData('0x5ddb2c8207c10b96fac92cb934ef9ba004bc007a073c9e5b13edc422f209ed80')
```

This will return a document similar to:

```json
{
    "version": "0.1.0",
    "appCode": "YourApp",
    "metadata": {
      "referrer": {
        "address": "0x1f5B740436Fc5935622e92aa3b46818906F416E9",
        "version": "0.1.0",
      },
    },
}
```

## Upload document to IPFS
The SDK uses Pinata to upload it to IPFS, so you will need an API Key in order to upload it using the SDK.

Alternativelly, you can upload the document on your own using any other service.

```js
// Make sure yuou provide the IPFS params when instanciating the SDK
const cowSdk = new CowSdk(4, {
  ipfs: { 
    pinataApiKey: 'YOUR_PINATA_API_KEY', 
    pinataApiSecret: 'YOUR_PINATA_API_SECRET'
  },
})

// Upload to IPFS
const uploadedAppDataHash = await cowSdk.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
```

## Convert IPFS CIDv0 to AppData (and back)
Given an IPFS CIDv0 you can convert it to an `AppData` 

```js
const decodedAppDataHex = await cowSdk.metadataApi.cidToAppDataHex('QmUf2TrpSANVXdgcYfAAACe6kg551cY3rAemB7xfEMjYvs')
```

This will return an `AppData` hex: `0x5ddb2c8207c10b96fac92cb934ef9ba004bc007a073c9e5b13edc422f209ed80`


> This might be handy if you decide to upload the document to IPFS yourself and then you need the AppData to post your order


Similarly, you can do the opposite and convert an `AppData` into an IPFS document:

```js
const decodedAppDataHex = await cowSdk.metadataApi.appDataHexToCid(hash)
```

This will return an IPFS CIDv0: `QmUf2TrpSANVXdgcYfAAACe6kg551cY3rAemB7xfEMjYvs`



## Querying the Cow Subgraph

You can query the Cow Subgraph either by running some common queries exposed by the `CowSubgraphApi` or by building your own ones:

```js
const chainId = 1 // Mainnet
const cowSdk = new CowSdk(chainId)

// Get Cow Protocol totals
const { tokens, orders, traders, settlements, volumeUsd, volumeEth, feesUsd, feesEth } =
  await cowSdk.cowSubgraphApi.getTotals()
console.log({ tokens, orders, traders, settlements, volumeUsd, volumeEth, feesUsd, feesEth })

// Get last 24 hours volume in usd
const { hourlyTotals } = await cowSdk.cowSubgraphApi.getLastHoursVolume(24)
console.log(hourlyTotals)

// Get last week volume in usd
const { dailyTotals } = await cowSdk.cowSubgraphApi.getLastDaysVolume(7)
console.log(dailyTotals)

// Get the last 5 batches
const query = `
  query LastBatches($n: Int!) {
    settlements(orderBy: firstTradeTimestamp, orderDirection: desc, first: $n) {
      txHash
      firstTradeTimestamp
    }
  }
`
const variables = { n: 5 }
const response = await cowSdk.cowSubgraphApi.runQuery(query, variables)
console.log(response)
```

### Install Dependencies

```bash
yarn
```

### Build

```bash
yarn build

# Build in watch mode
yarn start
```

### Unit testing

```bash
yarn test
```
