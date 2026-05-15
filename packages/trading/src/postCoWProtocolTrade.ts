import { OrderBookApi, OrderCreation, SigningScheme } from '@cowprotocol/sdk-order-book'
import { TradingAppDataInfo, LimitTradeParameters, OrderPostingResult, PostTradeAdditionalParams } from './types'
import { SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { getOrderToSign } from './getOrderToSign'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getIsEthFlowOrder } from './utils/misc'
import { log, SignerLike } from '@cowprotocol/sdk-common'
import { resolveSigner } from './utils/resolveSigner'

export async function postCoWProtocolTrade(
  orderBookApi: OrderBookApi,
  appData: TradingAppDataInfo,
  params: LimitTradeParameters,
  additionalParams: PostTradeAdditionalParams = {},
  paramSigner?: SignerLike,
): Promise<OrderPostingResult> {
  const signer = resolveSigner(paramSigner)
  const {
    networkCostsAmount = '0',
    signingScheme: _signingScheme = SigningScheme.EIP712,
    customEIP1271Signature,
    applyCostsSlippageAndFees,
    protocolFeeBps,
  } = additionalParams

  const isEthFlow = getIsEthFlowOrder(params)

  if (isEthFlow) {
    const quoteId = params.quoteId

    if (typeof quoteId === 'number') {
      return postSellNativeCurrencyOrder(orderBookApi, appData, { ...params, quoteId }, additionalParams, paramSigner)
    } else {
      throw new Error('quoteId is required for EthFlow orders')
    }
  }

  const { quoteId = null, owner } = params
  const { appDataKeccak256, fullAppData } = appData

  const env = params.env ?? orderBookApi.context.env
  const settlementContractOverride = params.settlementContractOverride
  const chainId = orderBookApi.context.chainId
  const from = owner || (await signer.getAddress())

  const orderToSign = getOrderToSign(
    { chainId, from, networkCostsAmount, isEthFlow, applyCostsSlippageAndFees, protocolFeeBps },
    params,
    appData.appDataKeccak256,
  )

  log('Uploading app-data')
  await orderBookApi.uploadAppData(appDataKeccak256, fullAppData)

  log('Signing order...')

  const { signature, signingScheme } = await (async () => {
    if (_signingScheme === SigningScheme.PRESIGN) {
      return { signature: from, signingScheme: SigningScheme.PRESIGN }
    } else {
      const isEip1271 = _signingScheme === SigningScheme.EIP1271
      if (isEip1271 && customEIP1271Signature) {
        return {
          signature: await customEIP1271Signature(orderToSign, signer),
          signingScheme: _signingScheme,
        }
      }

      const signingResult = await OrderSigningUtils.signOrder(orderToSign, chainId, signer, {
        env,
        settlementContractOverride,
      })

      if (isEip1271) {
        return {
          signature: OrderSigningUtils.getEip1271Signature(orderToSign, signingResult.signature),
          signingScheme: _signingScheme,
        }
      }

      // Auto-route wrapped signatures (EIP-7702 delegates that produce
      // ERC-7739 nested envelopes, ERC-7579 / Modular Account v2
      // validator-prefixed sigs, or stacked combinations) to EIP-1271 with
      // raw wallet bytes forwarded verbatim. CoW resolves verification via
      // `isValidSignature` on `from`, which EIP-7702 dispatches to the
      // delegate. Detection is by byte length: anything other than a
      // 65-byte ECDSA is treated as wrapped.
      const sigHex = (signingResult.signature ?? '').replace(/^0x/, '')
      const ECDSA_HEX_LEN = 65 * 2
      if (sigHex.length > 0 && sigHex.length !== ECDSA_HEX_LEN) {
        return {
          signature: signingResult.signature,
          signingScheme: SigningScheme.EIP1271,
        }
      }

      return { signature: signingResult.signature, signingScheme: SIGN_SCHEME_MAP[signingResult.signingScheme] }
    }
  })()

  const orderBody: OrderCreation = {
    ...orderToSign,
    from,
    signature,
    signingScheme,
    quoteId,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
  }

  log('Posting order...')

  const orderId = await orderBookApi.sendOrder(orderBody)

  log(`Order created, id: ${orderId}`)

  return { orderId, signature, signingScheme, orderToSign }
}
