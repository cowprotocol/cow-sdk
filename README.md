<p align="center">
  <img width="400" src="https://raw.githubusercontent.com/cowprotocol/cow-sdk/main/docs/images/CoW.png">
</p>

# CoW SDK

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


> For a quick snippet with the full process on posting an order see the [Post an Order Example](./docs/post-order-example.ts)


## CoW API
The SDK provides access to the CoW API. The CoW API allows you:
- Post orders
- Get fee quotes
- Get order details
- Get history of orders: i.e. filtering by account, transaction hash, etc.

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

> For more information about the API methods, you can check [api.cow.fi/docs](https://api.cow.fi/docs).

## Sign and Post orders
In order to trade, you will need to create a valid order first.

On the contraty to other decentralised exchanges, creating orders is free in CoW Protocol. This is because, one of the 
most common ways to do it is by created offchain signed messages (meta-transactions, uses `EIP-712` or `EIP-1271`).

Posting orders is a three steps process:

- 1. **Get Market Pricea**: Fee & Price
- 2. **Sign the order**: Using off-chain signing or Meta-transactions
- 3. **Post the signed order to the API**: So, the order becomes `OPEN`

The next sections will guide you through the process of creating a valid order.

> For a quick snippet with the full process on posting an order see the [Post an Order Example](./docs/post-order-example.ts).

### Enable tokens (token approval)
Because of the use of off-chain signing (meta-transactions), users will need to **Enable the sell token**  before signed
orders can be considered as valid ones. 

This enabling is technically an `ERC-20` approval, and is something that needs to be done only once. After this all 
order creation can be done for free using offchain signing.

> For more details see https://docs.cow.fi/tutorials/how-to-submit-orders-via-the-api/1.-set-allowance-for-the-sell-token

### Instantiate SDK with a signer
Before you can sign any transaction, you have to instantiate the SDK with a [Ethers.JS signer](https://docs.ethers.io/v5/api/signer/):

```js
import { Wallet } from 'ethers'
import { CowSdk, OrderKind } from '@cowprotocol/cow-sdk'

const mnemonic = 'fall dirt bread cactus...'
const wallet = Wallet.fromMnemonic(mnemonic)
const cowSdk = new CowSdk(
  4, {            // Leaving chainId empty will default to MAINNET
  signer: wallet  // Provide a signer, so you can sign order
  }) 
```

### STEP 1: Get Market Price
To create an order, you need to get a price/fee quote first:

  * The SDK will give you easy access to the API, which returns the `Market Price` and the `Fee` for any given trade you intent to do.
  * The returned `Market Price` is not strictly needed, you can use your own pricing logic. 
    * You can choose a price that is below this Market price (**Market Order**), or above Market Price (**Limit Order**).
  * The `Fee` however is very important. 
    * It is the required amount in sell token the trader agrees on paying for executing the order onchain. 
    * Normally, its value is proportional to the current Gas Price of the network. 
    * This fee is never charged if you don't trade.

To get the quote, you simply specify the trade you intent to do:

```js
const quoteResponse = await cowSdk.cowApi.getQuote({
  kind: OrderKind.SELL, // Sell order (could also be BUY)
  sellToken: '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
  buyToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b', // USDC
  amount: '1000000000000000000', // 1 WETH
  userAddress: '0x1811be0994930fe9480eaede25165608b093ad7a', // Trader
  validTo: 2524608000,
})

const { sellToken, buyToken, validTo, buyAmount, sellAmount, receiver, feeAmount } = quoteResponse.quote
```

### STEP 2: Sign the order
Once you know the price and fee, we can create the order and sign it:

  * Technically the order is just a signed message with your intent to trade, and contains your `Limit Price` and `Fee`.
  * As explained before, you can choose your `Limit Price`, but some general approach is to take the current Market Price
  and apply some slippage tolerance to it. `Received Amount = Expected Amount * (1 - Slippage Tolerance)`
  * The SDK will provide an easy way to sign orders given the raw data


```js
const { sellToken, buyToken, validTo, buyAmount, sellAmount, receiver, feeAmount } = quoteResponse.quote

// Prepare the RAW order
const order = {
  kind: OrderKind.SELL, // SELL || BUY  
  receiver, // Your account or any other
  sellToken,
  buyToken,

  partiallyFillable: false, // ("false" is for a "Fill or Kill" order, "true" for allowing "Partial execution" which is not supported yet)

  // Deadline
  validTo,

  // Limit Price
  //    You can apply some slippage tolerance here to make sure the trade is executed. 
  //    CoW protocol protects from MEV, so it can work with higher slippages
  sellAmount,
  buyAmount, 

  // Use the fee you received from the API
  feeAmount,

  // The appData allows you to attach arbitrary information (meta-data) to the order. Its explained in their own section. For now, you can use this 0x0 value
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000'
}

// Sign the order
const signedOrder = await cowSdk.signOrder(order)
```

At this point, you have a signed order. So next step will be to post it to the API so it's considered by the solvers and executed.

  
## STEP 3: **Post the signed order to the API**: 
Once you have a signed order, last step is to send it to the API.
  * The API will accept the order if its correctly signed, the deadline is correct, and the fee is enough to settle it
  * Once accepted, the order will be `OPEN` until the specified `validTo` date (expiration)
  * The possible outcomes once accepted is:
      * The order is `EXECUTED`: you will pay the signed fee, and get at least the `buyAmount` tokens you specified, although you will probably get more! (you will probably get a so-called **Surplus**).
      * The order `EXPIRES`: If your price is not good enough, and the order is out of the market price before
      expiration, your order will expire. This doesn't have any cost to the user, which **only pays the fee if the trade is executed**.
      * You cancel the order, so it becomes `CANCELLED`. Cancelling an order can be done both as a free meta-transaction
       (**soft cancelations**) or as a regular on-chain transaction (**hard cancelations**).
  * The API will return an `orderId` which identifies the order, and is created as a summary (hash) of it. In other words, the `orderId` is deterministic given all the order parameters.


Post an order using the SDK:

```js
const orderId = await cowSdk.cowApi.sendOrder({
  order: { ...order, ...signedOrder },
  owner: '0x1811be0994930fe9480eaede25165608b093ad7a',
})
```


### BONUS: Show link to Explorer
Once the order is posted, its good to allow to check the state of it. 

One easy is to check in the CoW Explorer. You can create a CoW Explorer link if you have the `orderId`:

```js
// View order in explorer
console.log(`https://explorer.cow.fi/rinkeby/orders/${orderId}`)
```


## Create a meta-data document for attaching to an order
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
The `AppData` Hex points to an IPFS document with the meta-data attached to the order.

You can calculate the `AppData` Hex, and its corresponding `cidV0` using the SDK:

```js
const { appDataHash, cidv0 } = await cowSdk.metadataApi.calculateAppDataHash(appDataDoc)
```

Note how this operation is deterministic, so given the same document, it will always generate the same hash. 

This method can be used to calculate the actual hash before uploading the document to IPFS.


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
// Make sure you provide the IPFS params when instantiating the SDK
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
