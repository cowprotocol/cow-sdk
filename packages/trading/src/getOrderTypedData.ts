import { OrderTypedData } from './types'
import { COW_EIP712_TYPES, ORDER_PRIMARY_TYPE, OrderSigningUtils, UnsignedOrder } from '@cowprotocol/sdk-order-signing'
import { SupportedEvmChainId } from '@cowprotocol/sdk-config'

const EIP712DomainTypes = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

export async function getOrderTypedData(
  chainId: SupportedEvmChainId,
  orderToSign: UnsignedOrder,
): Promise<OrderTypedData> {
  const domain = (await OrderSigningUtils.getDomain(chainId)) as OrderTypedData['domain']

  return {
    domain,
    primaryType: ORDER_PRIMARY_TYPE,
    types: {
      ...COW_EIP712_TYPES,
      EIP712Domain: EIP712DomainTypes,
    },
    message: orderToSign,
  }
}
