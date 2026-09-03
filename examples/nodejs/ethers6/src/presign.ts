import 'dotenv/config'
import { JsonRpcProvider, Wallet, parseUnits } from 'ethers'
import {
  setGlobalAdapter,
  SigningScheme,
  SupportedChainId,
  TradingSdk,
  OrderKind,
  WRAPPED_NATIVE_CURRENCIES,
  type SwapAdvancedSettings,
} from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'

/**
 * Pre-signing without giving the SDK a key.
 *
 * A `PRESIGN` order carries no off-chain signature: it is validated by a `setPreSignature`
 * transaction sent by the order owner, which is what makes it the natural scheme for Safes,
 * multisigs and custody stacks. `getPreSignCallData` builds that transaction as plain
 * `{ to, data, value }` — it never reads a signer, calls the provider, or estimates gas — so it
 * can run wherever the order UID is known, including an environment that holds no key at all.
 *
 * The three phases below run against separate SDK instances on purpose, because that is how they
 * are deployed in practice:
 *
 *   1. create the PRESIGN order (still needs a signer today)
 *   2. build the pre-sign calldata — signer-less
 *   3. execute it from the owner's own wallet, multisig, or custody stack
 *
 * Here the owner is a local `Wallet` so the example runs end to end. With a Safe, `owner` would be
 * the Safe address and phase 3 would be a Safe transaction proposal instead of `sendTransaction`.
 * Either way the order owner encoded in the UID is the account that must send the transaction.
 *
 * Note: the owner account must hold the sell token and have approved the CoW Protocol Vault
 * Relayer, otherwise the order book rejects the order.
 */

// =================== Config ===================
const RPC_URL = 'https://sepolia.gateway.tenderly.co'
const PRIVATE_KEY = '' // private key here (0x...) — only phases 1 and 3 ever see it
const DEFAULT_SELL_AMOUNT = '0.1' // WETH amount
// ===============================================================

async function main() {
  const chainId = SupportedChainId.SEPOLIA
  const appCode = 'CoWSdkPresignExample'

  if (!PRIVATE_KEY) {
    console.log('Set PRIVATE_KEY to run this example')
    process.exit(0)
  }

  const provider = new JsonRpcProvider(RPC_URL, chainId)
  const wallet = new Wallet(PRIVATE_KEY, provider)
  const owner = wallet.address as `0x${string}`

  const WETH = WRAPPED_NATIVE_CURRENCIES[chainId]
  const USDC = { address: '0xbe72E441BF55620febc26715db68d3494213D8Cb', decimals: 18 }
  const amount = parseUnits(DEFAULT_SELL_AMOUNT, WETH.decimals).toString()

  console.log('Owner:', owner)

  // ----- Phase 1: create the order with the PRESIGN signing scheme -----
  // Nothing is signed here: a PRESIGN order is posted with the owner address in place of a
  // signature. The signer is still required to reach this code path today.
  setGlobalAdapter(new EthersV6Adapter({ provider, signer: wallet }))

  const orderSdk = new TradingSdk({ chainId, appCode, signer: wallet })

  const advancedSettings: SwapAdvancedSettings = {
    quoteRequest: {
      signingScheme: SigningScheme.PRESIGN,
    },
  }

  console.log('Posting order...')
  const { orderId } = await orderSdk.postSwapOrder(
    {
      kind: OrderKind.SELL,
      owner,
      amount,
      sellToken: WETH.address,
      sellTokenDecimals: WETH.decimals,
      buyToken: USDC.address,
      buyTokenDecimals: USDC.decimals,
      slippageBps: 50,
    },
    advancedSettings,
  )
  console.log('Order created with "pre-sign" state, id:', orderId)

  // ----- Phase 2: build the pre-sign transaction with no signer -----
  // A fresh, signer-less adapter: this is what a backend, an offline transaction builder, or a
  // Safe proposal service would run. The adapter is only here for ABI encoding, which is
  // adapter-specific; no key is available in this environment.
  const signerlessAdapter = new EthersV6Adapter({ provider })
  console.log('Adapter has a signer:', signerlessAdapter.signerOrNull() !== null)
  setGlobalAdapter(signerlessAdapter)

  const preSignSdk = new TradingSdk({ chainId, appCode })
  const preSignCallData = preSignSdk.getPreSignCallData({ orderUid: orderId })
  console.log('Pre-sign calldata:', preSignCallData)

  // ----- Phase 3: execute it from the owner's wallet / multisig / custody stack -----
  // Gas is estimated here, in the execution context, rather than by the SDK. Swap this for
  // `safe.createTransaction(...)` or your custody provider's submit call as needed.
  console.log('Sending pre-sign transaction...')
  const tx = await wallet.sendTransaction(preSignCallData)
  const receipt = await tx.wait()
  console.log('Order signed on-chain, tx:', receipt?.hash)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
