import { OrderBookApi, OrderCreation, SigningScheme } from '@cowprotocol/sdk-order-book'
import { TradingAppDataInfo, LimitTradeParameters, OrderPostingResult, PostTradeAdditionalParams } from './types'
import { SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { ORDER_TYPE_FIELDS } from '@cowprotocol/sdk-contracts-ts'
import { getOrderToSign } from './getOrderToSign'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getIsEthFlowOrder } from './utils/misc'
import { getGlobalAdapter, log, SignerLike } from '@cowprotocol/sdk-common'
import { resolveSigner } from './utils/resolveSigner'

const EIP7702_DELEGATION_PREFIX = '0xef0100'
const EIP7702_DELEGATION_HEX_LENGTH = 2 + 23 * 2 // "0x" + 23 bytes
const ECDSA_HEX_LENGTH = 65 * 2

/**
 * True if the address holds an EIP-7702 set-code marker (`0xef0100 || delegate`,
 * 23 bytes). These accounts are still EOAs but their `signTypedData_v4` may
 * return non-ECDSA bytes (ERC-7739 nested envelopes, ERC-7579 / Modular Account
 * v2 validator-prefixed sigs). The bytes verify via the owner's
 * `isValidSignature`, which 7702 dispatches to the delegate.
 */
async function isEip7702DelegatedAccount(owner: string): Promise<boolean> {
  try {
    const code = (await getGlobalAdapter().getCode(owner)) ?? '0x'
    if (typeof code !== 'string') return false
    const lower = code.toLowerCase()
    return lower.length === EIP7702_DELEGATION_HEX_LENGTH && lower.startsWith(EIP7702_DELEGATION_PREFIX)
  } catch {
    // Treat any RPC error as "not delegated" — fall through to the existing
    // signing path so plain EOAs aren't penalized when getCode is unavailable.
    return false
  }
}

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
        // Note: `OrderSigningUtils.getDomain` only accepts chainId in the
        // exported surface today; env/settlementContractOverride aren't
        // plumbed through. That's a separate fix from the wrapping path.
        const domain = await OrderSigningUtils.getDomain(chainId)
        const rawSig = await signer.signTypedData(
          domain as unknown as Record<string, unknown>,
          { Order: ORDER_TYPE_FIELDS },
          orderToSign as unknown as Record<string, unknown>,
        )
        const hexLen = (rawSig ?? '').replace(/^0x/, '').length
        if (hexLen === ECDSA_HEX_LENGTH) {
          // Plain ECDSA from a 7702 delegate (e.g. Metamask Smart Account).
          // Same path as a regular EOA — eip712.
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
