import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  hashify,
  normalizeBuyTokenBalance,
  ORDER_TYPE_FIELDS,
  ORDER_UID_LENGTH,
  timestamp,
  normalizeOrder,
  hashTypedData,
  hashOrder,
  computeOrderUid,
  packOrderUidParams,
  extractOrderUidParams,
} from './order'
import { deterministicDeploymentAddress } from './deploy'
import { normalizeInteraction, normalizeInteractions } from './interaction'
import { implementationAddress, ownerAddress, proxyInterface } from './proxy'
import { decodeEip1271SignatureData, encodeEip1271SignatureData, signOrder } from './sign'
import { grantRequiredRoles } from './vault'
import {
  encodeSigningScheme,
  decodeSigningScheme,
  encodeOrderFlags,
  decodeOrderFlags,
  encodeTradeFlags,
  decodeTradeFlags,
  encodeSignatureData,
  decodeSignatureOwner,
  encodeTrade,
  decodeOrder,
  TokenRegistry,
  SettlementEncoder,
  InteractionStage,
  FLAG_MASKS,
} from './settlement'
import { encodeSwapStep, SwapEncoder } from './swap'

export class ContractsTs {
  // Make ORDER_TYPE_FIELDS and ORDER_UID_LENGTH available
  public ORDER_TYPE_FIELDS = ORDER_TYPE_FIELDS
  public ORDER_UID_LENGTH = ORDER_UID_LENGTH

  /**
   * Creates a new ContractsTs instance
   *
   * @param adapter Provider adapter implementation
   */
  constructor(adapter: AbstractProviderAdapter) {
    setGlobalAdapter(adapter)
  }

  //deploy
  deterministicDeploymentAddress = deterministicDeploymentAddress

  //interaction
  normalizeInteraction = normalizeInteraction
  normalizeInteractions = normalizeInteractions

  //order
  timestamp = timestamp
  hashify = hashify
  normalizeBuyTokenBalance = normalizeBuyTokenBalance
  normalizeOrder = normalizeOrder
  hashTypedData = hashTypedData
  hashOrder = hashOrder
  computeOrderUid = computeOrderUid
  packOrderUidParams = packOrderUidParams
  extractOrderUidParams = extractOrderUidParams

  //proxy
  implementationAddress = implementationAddress
  ownerAddress = ownerAddress
  proxyInterface = proxyInterface

  //sign
  signOrder = signOrder
  encodeEip1271SignatureData = encodeEip1271SignatureData
  decodeEip1271SignatureData = decodeEip1271SignatureData

  //vault
  grantRequiredRoles = grantRequiredRoles

  //settlement
  encodeSigningScheme = encodeSigningScheme
  decodeSigningScheme = decodeSigningScheme
  encodeOrderFlags = encodeOrderFlags
  decodeOrderFlags = decodeOrderFlags
  encodeTradeFlags = encodeTradeFlags
  decodeTradeFlags = decodeTradeFlags
  encodeSignatureData = encodeSignatureData
  decodeSignatureOwner = decodeSignatureOwner
  encodeTrade = encodeTrade
  decodeOrder = decodeOrder
  TokenRegistry = TokenRegistry
  SettlementEncoder = SettlementEncoder
  InteractionStage = InteractionStage
  FLAG_MASKS = FLAG_MASKS

  //swap
  encodeSwapStep = encodeSwapStep
  SwapEncoder = SwapEncoder

  /**
   * Return the Gnosis Protocol v2 domain used for signing.
   * @param chainId The EIP-155 chain ID.
   * @param verifyingContract The address of the contract that will verify the
   * signature.
   * @return An EIP-712 compatible typed domain data.
   */
  public static domain(chainId: number, verifyingContract: string) {
    return {
      name: 'Gnosis Protocol',
      version: 'v2',
      chainId,
      verifyingContract,
    }
  }
}
