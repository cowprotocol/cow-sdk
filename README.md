<p align="center">
  <img width="400" src="https://raw.githubusercontent.com/gnosis/cow-sdk/main/docs/images/CoW.png">
</p>

# CoW protocol SDK
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![Coverage Status](https://coveralls.io/repos/github/cowprotocol/cow-sdk/badge.svg?branch=main)](https://coveralls.io/github/cowprotocol/cow-sdk?branch=main)


> ⚠️⚠️ THE SDK IS IN Beta ⚠️⚠️
> It is being currently develop and is a work in progress, also it's API is subjected to change. 
> If you experience any problems, please open an issue in Github trying to describe your problem.

### Getting started

Install the SDK:

```bash
yarn add @cowprotocol/cow-sdk
```

Instantiate the SDK:

```js
import { CowSdk } from 'cow-sdk'

const chainId = 4 // Rinkeby
const cowSdk = new CowSdk(chainId)
```

The SDK will expose the CoW API operations (`cowSdk.cowApi`) and some convenient method that will facilitate signing orders (`cowSdk.signOrder`). Future version will provide easy access to The Graph data and some other convenient utils.

```js
// i.e. Get last 5 orders for a given trader
const trades = await cowSdk.cowApi.getOrders({
  owner: '0x00000000005ef87f8ca7014309ece7260bbcdaeb', // Trader
  limit: 5,
  offset: 0
})
console.log(trades)
```

Let's see a full example on how to submit an order to CowSwap.

> ⚠️ Before starting, the protocol requires you to approve the sell token before the order can be considered. 
> For more details see https://docs.cow.fi/tutorials/how-to-submit-orders-via-the-api/1.-set-allowance-for-the-sell-token

In this example, we will:
- 1. **Instantiate the SDK and a wallet**: Used for signing orders
- 2. **Get a price/fee quote from the API**: Get current market price and required protocol fee to settle your trade.
- 3. **Sign the order using your wallet**: Only signed orders are considered by the protocol.
- 4. **Post the signed order to the API**: Post the order so it can be executed.

```js
import { Wallet } from 'ethers'
import { CowSdk, OrderKind } from 'cow-sdk'

// 1. Instantiate wallet and SDK
const mnemonic = 'fall dirt bread cactus...'
const wallet = Wallet.fromMnemonic(mnemonic)
const cowSdk = new CowSdk(4, { signer: wallet })

// 2. Get a price/fee quote from the API
//    It will return the price and fee to "Sell 1 ETH for USDC"
const quoteResponse = await cowSdk.cowApi.getQuote({
  kind: OrderKind.SELL, // Sell order (could also be BUY)
  sellToken: '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
  buyToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',  // USDC
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
```

SDK also includes a Metadata API to interact with AppData documents and IPFS CIDs

```js
 const chainId = 4 // Rinkeby
 const cowSdk = new CowSdk(chainId)
 let hash = '0xa6c81f4ca727252a05b108f1742a07430f28d474d2a3492d8f325746824d22e5'
 
 // Decode AppData document given a CID hash
 const appDataDoc = await cowSdk.metadataApi.decodeAppData(hash)
 console.log(appDataDoc)
  /* {
      "appCode": "CowSwap",
      "metadata": {
          "referrer": {
              "address": "0x1f5B740436Fc5935622e92aa3b46818906F416E9",
              "version": "0.1.0"
          }
      },
      "version": "0.1.0"
  } */

  const cid = 'QmUf2TrpSANVXdgcYfAAACe6kg551cY3rAemB7xfEMjYvs'
  
  // Decode CID hash to AppData Hex 
  const decodedAppDataHex  = await cowSdk.metadataApi.cidToAppDataHex(cid)
  console.log(decodedAppDataHex) //0x5ddb2c8207c10b96fac92cb934ef9ba004bc007a073c9e5b13edc422f209ed80

  hash = '0x5ddb2c8207c10b96fac92cb934ef9ba004bc007a073c9e5b13edc422f209ed80'

  // Decode AppData Hex to CID
  const decodedAppDataHex  = await cowSdk.metadataApi.appDataHexToCid(hash)
  console.log(decodedAppDataHex) //QmUf2TrpSANVXdgcYfAAACe6kg551cY3rAemB7xfEMjYvs
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
