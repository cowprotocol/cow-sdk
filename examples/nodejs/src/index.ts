import {
  SupportedChainId,
  OrderKind,
  postSwapOrder,
  postLimitOrder,
  enableLogging,
  AcrossBridgeProvider,
  BridgingSdk,
  OrderBookApi,
} from '../../../src'
import { JsonRpcProvider } from '@ethersproject/providers'

enableLogging(true)

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
  })
})()

// Swap with partner fee
;(async function () {
  return

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
            volumeBps: 100,
            recipient: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
          },
        },
      },
    },
  )
})()

// Get bridging order
;(async function () {
  return

  const acrossProvider = new AcrossBridgeProvider()
  const sdk = new BridgingSdk({
    providers: [acrossProvider],
    orderBookApi: new OrderBookApi({
      backoffOpts: {
        maxDelay: 0,
        numOfAttempts: 0,
      },
    }),
  })

  const data = await sdk.getOrder({
    chainId: SupportedChainId.MAINNET,
    env: 'staging',
    rpcProvider: new JsonRpcProvider('https://mainnet.gateway.tenderly.co'),
    orderId:
      '0xb8aeae0626654ea134614a42044dcf081544981e19f35082e20c967d5210834dfb3c7eb936caa12b5a884d612393969a557d430768248d30',
  })

  console.log('Bidging order data', data)
})()
