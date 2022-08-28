import { Wallet } from 'ethers'
import { CowSdk, OrderKind } from '@cowprotocol/cow-sdk'

/* --------------------   GET STARTED: Instantiate the SDK   -------------------- */
const mnemonic = 'fall dirt bread cactus...'
const wallet = Wallet.fromMnemonic(mnemonic)
const cowSdk = new CowSdk(
  // Leaving chainId empty will default to MAINNET
  4,
  {
    signer: wallet, // Provide a signer, so you can sign order
  }
)

// Also, make sure the token you try to sell has been enabled. For more info:
//    https://docs.cow.fi/tutorials/how-to-submit-orders-via-the-api/1.-set-allowance-for-the-sell-token

/* --------------------   STEP 1: Get quote   -------------------- */
const quoteResponse = await cowSdk.cowApi.getQuote({
  kind: OrderKind.SELL, // Sell order (could also be BUY)
  sellToken: '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
  buyToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b', // USDC
  amount: '1000000000000000000', // 1 WETH
  userAddress: '0x1811be0994930fe9480eaede25165608b093ad7a', // Trader
  validTo: 2524608000,
})

/* --------------------   STEP 2: Sign the order   -------------------- */
// Prepare the RAW order
const { sellToken, buyToken, validTo, buyAmount, sellAmount, receiver, feeAmount } = quoteResponse.quote
const order = {
  kind: OrderKind.SELL, // SELL / BUY
  receiver, // Your account or any other
  sellToken,
  buyToken,

  partiallyFillable: false, // ("false" would be for a "Fill or Kill" order, "true" for allowing "Partial execution" which is not supported yet)

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
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
}

// Sign raw order
const signedOrder = await cowSdk.signOrder(order)

/* --------------------   STEP 3: Post signed order   -------------------- */
const orderId = await cowSdk.cowApi.sendOrder({
  order: { ...order, ...signedOrder },
  owner: '0x1811be0994930fe9480eaede25165608b093ad7a',
})

/* --------------------  BONUS: Link to the CoW Explorer   -------------------- */
// View order in explorer
console.log(`https://explorer.cow.fi/rinkeby/orders/${orderId}`)
