import { SupportedChainId, OrderKind, postSwapOrder, postLimitOrder } from '../../../src'

const privateKey = 'xxx'

// Swap
;(async function () {
  return

  postSwapOrder({
    appCode: 'cow-sdk-example',
    signer: privateKey,
    chainId: SupportedChainId.SEPOLIA,

    kind: OrderKind.SELL,
    sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    sellTokenDecimals: 18,
    buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
    buyTokenDecimals: 18,
    amount: '120000000000000000',
  })
})()

// Limit order
;(async function () {
  return

  postLimitOrder({
    appCode: 'cow-sdk-example',
    signer: privateKey,
    chainId: SupportedChainId.SEPOLIA,

    kind: OrderKind.BUY,
    sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    sellTokenDecimals: 18,
    buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
    buyTokenDecimals: 18,
    sellAmount: '120000000000000000',
    buyAmount: '66600000000000000000',
    networkCostsAmount: '0',
  })
})()

// Swap with partner fee
;(async function () {
  postSwapOrder(
    {
      appCode: 'cow-sdk-example',
      signer: privateKey,
      chainId: SupportedChainId.SEPOLIA,

      kind: OrderKind.SELL,
      sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
      sellTokenDecimals: 18,
      buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
      buyTokenDecimals: 18,
      amount: '120000000000000000',
    },
    {
      appData: {
        metadata: {
          partnerFee: {
            bps: 100,
            recipient: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
          },
        },
      },
    }
  )
})()
