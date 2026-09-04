import { getGlobalAdapter, GPV2SettlementAbi } from '@cowprotocol/sdk-common'
import { ProtocolOptions, SupportedChainId } from '@cowprotocol/sdk-config'
import { TradingTransactionParams } from './types'
import { getSettlementContractAddress } from './getSettlementContract'

/** Transaction data needed to set an order's on-chain pre-signature. */
export type PreSignCallData = Omit<TradingTransactionParams, 'gasLimit'>

/**
 * Builds `{ to, data, value }` for `setPreSignature(orderUid, true)`.
 *
 * Does not access a signer, make an RPC call, or estimate gas.
 *
 * @see TradingSdk.getPreSignCallData for the SDK-configured entry point.
 */
export function getPreSignCallData(
  chainId: SupportedChainId,
  orderUid: string,
  options?: ProtocolOptions,
): PreSignCallData {
  return {
    to: getSettlementContractAddress(chainId, options),
    data: getGlobalAdapter().utils.encodeFunction(GPV2SettlementAbi, 'setPreSignature', [orderUid, true]),
    value: '0',
  }
}
