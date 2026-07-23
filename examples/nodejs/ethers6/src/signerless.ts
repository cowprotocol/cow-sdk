import 'dotenv/config'
import { JsonRpcProvider, Wallet } from 'ethers'
import {
  setGlobalAdapter,
  SupportedChainId,
  TradingSdk,
  OrderKind,
  WRAPPED_NATIVE_CURRENCIES,
  getOrderToSubmit,
} from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'

/**
 * Signer-less trading: the SDK never receives a signer or private key.
 *
 * The order is signed "externally" — here by a local ethers Wallet standing in for
 * a cold wallet (e.g. Tangem), an MPC/custody service (e.g. Fireblocks), or any
 * other environment that can produce an eth_signTypedData_v4 signature.
 *
 * Note: the owner account must hold the sell token and have approved the
 * CoW Protocol Vault Relayer, otherwise the order book rejects the order.
 */

// =================== Config ===================
const RPC_URL = 'https://sepolia.gateway.tenderly.co'
const PRIVATE_KEY = '' // private key here (0x...) — held by the "cold wallet", never passed to the SDK
const DEFAULT_SELL_AMOUNT = '0.1' // WETH amount
// ===============================================================

async function main() {
  const chainId = SupportedChainId.SEPOLIA

  if (!PRIVATE_KEY) {
    console.log('Set PRIVATE_KEY to run this example')
    process.exit(0)
  }

  // ----- External signing environment (cold wallet / custody) -----
  const coldWallet = new Wallet(PRIVATE_KEY)
  const owner = coldWallet.address as `0x${string}`

  // ----- Integrator environment: adapter WITHOUT a signer -----
  // The adapter is only used for hashing utilities (app-data); no key ever enters it
  setGlobalAdapter(new EthersV6Adapter({ provider: new JsonRpcProvider(RPC_URL, chainId) }))

  const sdk = new TradingSdk({ chainId, appCode: 'CoWSdkSignerlessExample' })

  const WETH = WRAPPED_NATIVE_CURRENCIES[chainId]
  const USDC = { address: '0xbe72E441BF55620febc26715db68d3494213D8Cb', decimals: 18 }
  const amount = Math.round(Number(DEFAULT_SELL_AMOUNT) * 10 ** WETH.decimals).toString()

  console.log('Owner:', owner)
  console.log('Getting quote...')
  const quoteResults = await sdk.getQuoteOnly({
    owner,
    kind: OrderKind.SELL,
    amount,
    sellToken: WETH.address,
    sellTokenDecimals: WETH.decimals,
    buyToken: USDC.address,
    buyTokenDecimals: USDC.decimals,
    slippageBps: 50,
  })

  // Everything sendOrder needs, except the signature.
  // The amounts differ from the quote: network costs and slippage are already folded in,
  // and that is what gets signed.
  // Defaults to EIP712 (matches signTypedData below). For personal_sign, compute the
  // EIP-712 digest, sign that, and pass SigningScheme.ETHSIGN as the 2nd argument.
  const orderToSubmit = getOrderToSubmit(quoteResults)
  console.log('Order to submit:', orderToSubmit)

  // ----- External signing environment -----
  // Sign the EIP-712 payload the quote came with. ethers derives the EIP712Domain type
  // from `domain` itself, so it must be dropped from `types`; when signing via raw
  // eth_signTypedData_v4 pass the whole `orderTypedData` object as-is instead.
  const { EIP712Domain: _, ...types } = quoteResults.orderTypedData.types
  const signature = await coldWallet.signTypedData(
    quoteResults.orderTypedData.domain,
    types,
    quoteResults.orderTypedData.message,
  )
  console.log('Signature:', signature)

  // ----- Integrator environment -----
  console.log('Posting order...')
  const { orderId } = await sdk.postSignedOrder(orderToSubmit, signature)
  console.log('Order created, id:', orderId)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
