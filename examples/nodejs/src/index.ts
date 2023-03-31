import { OrderBookApi, SupportedChainId } from '@cowprotocol/cow-sdk'
;(async function () {
  const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.MAINNET })

  const order = await orderBookApi.getOrder(
    '0xff2e2e54d178997f173266817c1e9ed6fee1a1aae4b43971c53b543cffcc2969845c6f5599fbb25dbdd1b9b013daf85c03f3c63763e4bc4a'
  )

  console.log('Order: ', order)
})()
