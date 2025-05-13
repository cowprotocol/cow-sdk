import { SupportedChainId } from 'src/chains'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { getAcrossDepositEvents, getCowTradeEvents, getPostHooks } from './util'
import { HOOK_DAPP_ACROSS_ID } from './const/misc'
import { OrderBookApi } from 'src/order-book'

export async function getDepositId(chainId: SupportedChainId, orderId: string, txReceipt: TransactionReceipt) {
  // Get deposit events
  const depositEvents = getAcrossDepositEvents(chainId, txReceipt.logs)

  if (depositEvents.length === 0) {
    // This should never happen, means the hook was not triggered
    throw new Error('No deposit events found in the settlement tx. Are you sure the hook was triggered?')
  }

  // TODO: Uncomment this line after testing. Why? Because, if there's only one deposit, there's no point on continuing the algorithm. We know the depositId already. This is commented to test the algorithm
  if (depositEvents.length === 1) {
    return depositEvents[0].depositId
  }

  // Just print some stuff
  for (const deposit of depositEvents) {
    console.log(
      `Across Deposit - depositId: ${
        deposit.depositId
      }, Input: ${deposit.inputAmount.toString()}, Output: ${deposit.outputAmount.toString()}`
    )
  }

  // Get CoW Trade events
  const cowTradeEvents = getCowTradeEvents(txReceipt.logs)

  // Fetch from API the details of all the settlement orders
  const orderbookApi = new OrderBookApi({ chainId })
  const ordersFromSettlement = await Promise.all(
    cowTradeEvents.map((tradeEvent) => orderbookApi.getOrder(tradeEvent.orderUid))
  )

  // Filter orders, leaving only cross-chain orders using Across provider
  const crossChainOrdersAcross = ordersFromSettlement.filter((order) => {
    // Get all post hooks from order
    const postHooks = getPostHooks(order.fullAppData ?? undefined)

    // Get the bridging hook from across
    const bridgingHook = postHooks.find((hook) => {
      return hook.dappId?.startsWith(HOOK_DAPP_ACROSS_ID)
    })

    // Return only orders that have a bridging hook
    return bridgingHook !== undefined
  })

  // Find relative position for the orderId in the settlement tx
  const orderIndex = crossChainOrdersAcross.findIndex((order) => order.uid === orderId)

  // Get the depositId from the relative position
  const depositId = depositEvents[orderIndex].depositId

  return depositId
}
