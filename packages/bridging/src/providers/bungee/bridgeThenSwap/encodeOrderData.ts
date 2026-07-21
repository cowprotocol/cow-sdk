import { getGlobalAdapter } from '@cowprotocol/sdk-common'
import { DestinationOrderParams } from '../../../types'

/**
 * ABI-encode an OrderFlowOrder.Data struct for use as the Bungee destination payload.
 * The encoded data will be passed to OrderFlowFactory.executeData() as the callData parameter.
 */
export function encodeOrderData(params: DestinationOrderParams): string {
  const adapter = getGlobalAdapter()

  const orderTuple = [
    params.sellToken, // sellToken (IERC20)
    params.buyToken, // buyToken (IERC20)
    params.receiver, // receiver
    params.owner, // owner
    params.sellAmount, // sellAmount
    params.buyAmount, // buyAmount
    params.appData, // appData (bytes32)
    params.feeAmount ?? 0n, // feeAmount
    params.validTo, // validTo (uint32)
    params.partiallyFillable ?? false, // partiallyFillable
    params.quoteId ?? 0, // quoteId (int64)
  ]

  return adapter.utils.encodeAbi(
    [
      'tuple(address sellToken, address buyToken, address receiver, address owner, uint256 sellAmount, uint256 buyAmount, bytes32 appData, uint256 feeAmount, uint32 validTo, bool partiallyFillable, int64 quoteId)',
    ],
    [orderTuple],
  ) as string
}
