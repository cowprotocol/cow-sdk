import { OrderBookApi, OrderCreation, SigningScheme } from '@cowprotocol/sdk-order-book'
import { TradingAppDataInfo, LimitTradeParameters, OrderPostingResult, PostTradeAdditionalParams } from './types'
import { SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { ORDER_TYPE_FIELDS } from '@cowprotocol/sdk-contracts-ts'
import { getOrderToSign } from './getOrderToSign'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getIsEthFlowOrder } from './utils/misc'
import { log, SignerLike } from '@cowprotocol/sdk-common'
import { resolveSigner } from './utils/resolveSigner'
import { isEip7702DelegatedAccount } from './utils/isEip7702DelegatedAccount'

const ECDSA_HEX_LENGTH = 65 * 2

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

      // EIP-7702 fast path: bypass `OrderSigningUtils.signOrder` for delegated
      // EOAs. That helper normalizes through `splitSignature`/`joinSignature`,
      // which either throws on long envelopes (ethers) or silently truncates
      // to the first 65 bytes (viem), so we'd lose the wrapped bytes before
      // we got a chance to route them. Calling `signer.signTypedData`
      // directly preserves whatever the wallet returned.
      //
      // Plain EOAs and Safes fall through to the normal `signOrder` path
      // which keeps its v4/v3/eth_sign fallback chain.
      if (await isEip7702DelegatedAccount(from)) {
        const domain = await OrderSigningUtils.getDomain(chainId, {
          env,
          settlementContractOverride,
        })
        const rawSig = await signer.signTypedData(
          domain as unknown as Record<string, unknown>,
          { Order: ORDER_TYPE_FIELDS },
          orderToSign as unknown as Record<string, unknown>,
        )
        const hexLen = (rawSig ?? '').replace(/^0x/, '').length
        if (hexLen === ECDSA_HEX_LENGTH) {
          // Plain ECDSA from a 7702 delegate (e.g. Metamask Smart Account).
          // Respect the caller's explicit scheme: if they asked for EIP1271,
          // wrap via the standard `(order, sig)` ABI tuple. Otherwise eip712.
          if (isEip1271) {
            return {
              signature: OrderSigningUtils.getEip1271Signature(orderToSign, rawSig),
              signingScheme: _signingScheme,
            }
          }
          return { signature: rawSig, signingScheme: SigningScheme.EIP712 }
        }
        // Wrapped bytes (ERC-7739 / ERC-7579 MA v2 / stacked) — forward to
        // CoW as eip1271 with `from = EOA`. CoW calls `isValidSignature`
        // on the owner; the EIP-7702 marker dispatches to the delegate
        // which handles unwrapping. No `(order, sig)` ABI tuple wrap.
        return { signature: rawSig, signingScheme: SigningScheme.EIP1271 }
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
