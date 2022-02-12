<p align="center">
  <img width="400" src="https://raw.githubusercontent.com/gnosis/cow-sdk/main/docs/images/CoW.png">
</p>

# CoW protocol SDK
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)


### Getting started

Install the Cow SDK library:

```bash
yarn add cow-sdk
```

Then you need to instantiate the SDK object:

```js
import { CowSdk } from 'cow-sdk'

const chainId = 4 // Rinkeby
const cowSdk = new CowSdk(chainId)
```

That should be enough to run queries against the CoW Protocol API:

```js
const trades = await cowSdk.cowApi.getTrades({ owner: "0x1811be0994930fE9480eAEDe25165608B093ad7A" })
console.log(trades)
```

In case you want to execute a swap, the SDK must be initialized with a Signer:

```js
import { Wallet } from 'ethers'
import { CowSdk, OrderKind } from 'cow-sdk'

const mnemonic = 'fall dirt bread cactus...'
const wallet = Wallet.fromMnemonic(mnemonic)
const cowSdk = new CowSdk(4, { signer: wallet })

// We will get a price quote for selling 1 WETH for USDC
const quoteResponse = await cowSdk.cowApi.getQuote({
  kind: OrderKind.SELL,
  amount: '1000000000000000000',
  sellToken: '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
  buyToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',  // USDC
  userAddress: '0x1811be0994930fe9480eaede25165608b093ad7a',
  validTo: 2524608000,
})

const order = {
  kind: OrderKind.SELL,
  sellToken: quoteResponse.quote.sellToken,
  buyToken: quoteResponse.quote.buyToken,
  validTo: quoteResponse.quote.validTo,
  buyAmount: quoteResponse.quote.buyAmount,
  sellAmount: quoteResponse.quote.sellAmount,
  receiver: quoteResponse.quote.receiver,
  partiallyFillable: false,
  feeAmount: quoteResponse.quote.feeAmount,
}

const signedOrder = await cowSdk.signOrder(order)

const orderId = await cowSdk.cowApi.sendOrder({
  order: { ...order, ...signedOrder },
  owner: '0x1811be0994930fe9480eaede25165608b093ad7a',
})

// We can inspect the Order details in the CoW Protocol Explorer
console.log(`https://explorer.cow.fi/rinkeby/orders/${orderId}`)
```

### Install Dependencies

```bash
yarn
```

### Build

```bash
yarn build
```

### Run

```bash
yarn start
```

### Lint


```bash
yarn lint
```

### Format


```bash
yarn format
```

### Unit testing

```bash
yarn test
```

