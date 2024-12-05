import { ORDER_TYPE_FIELDS } from '@cowprotocol/contracts'
import { ORDER_PRIMARY_TYPE, OrderTypedData } from './types'
import { OrderSigningUtils, UnsignedOrder } from '../order-signing'
import { SupportedChainId } from '../common'

const EIP712DomainTypes = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

export async function getOrderTypedData(
  chainId: SupportedChainId,
  orderToSign: UnsignedOrder
): Promise<OrderTypedData> {
  const domain = (await OrderSigningUtils.getDomain(chainId)) as OrderTypedData['domain']

  return {
    domain,
    primaryType: ORDER_PRIMARY_TYPE,
    types: {
      [ORDER_PRIMARY_TYPE]: ORDER_TYPE_FIELDS,
      EIP712Domain: EIP712DomainTypes,
    },
    message: orderToSign,
  }
}
