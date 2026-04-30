import 'dotenv/config'
import { createPublicClient, Hash, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import {
  setGlobalAdapter,
  SupportedChainId,
  TradingSdk,
  OrderKind,
  WRAPPED_NATIVE_CURRENCIES,
  LimitTradeParameters,
} from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

// =================== Config ===================
const RPC_URL = 'https://ethereum-sepolia-public.nodies.app'
const PRIVATE_KEY = '' // private key here (0x...)
const DEFAULT_SELL_AMOUNT = 0.01 // WETH amount

// ===============================================================

async function main() {
  const chainId = SupportedChainId.SEPOLIA

  if (!PRIVATE_KEY) {
    console.log('Set PRIVATE_KEY to run this example')
    process.exit(0)
  }

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  })

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)

  const adapter = new ViemAdapter({ provider: publicClient, signer: account })
  setGlobalAdapter(adapter)

  const sdk = new TradingSdk({
    chainId,
    appCode: 'CoWSdkNodeExampleViem',
    signer: account,
  })

  const WETH = WRAPPED_NATIVE_CURRENCIES[chainId]
  const USDC = { address: '0xbe72E441BF55620febc26715db68d3494213D8Cb', decimals: 18 }

  const owner = account.address
  const amount = BigInt(Math.floor(DEFAULT_SELL_AMOUNT * 10 ** WETH.decimals)) // 0.1 WETH
  const slippageBps = 50

  console.log('Getting quote...')

  const quoteAndPost = await sdk.getQuote({
    chainId,
    kind: OrderKind.SELL,
    owner,
    amount: amount.toString(),
    sellToken: WETH.address,
    sellTokenDecimals: WETH.decimals,
    buyToken: USDC.address,
    buyTokenDecimals: USDC.decimals,
    slippageBps,
  })

  const { beforeAllFees } = quoteAndPost.quoteResults.amountsAndCosts
  console.log('Current market rate (buy amount):', beforeAllFees.buyAmount)

  // Target: 5% above current market rate
  const targetBuyAmount = (beforeAllFees.buyAmount * 105n) / 100n
  console.log('Limit buy amount (+5%):', targetBuyAmount)

  const params: LimitTradeParameters = {
    kind: OrderKind.SELL,
    sellToken: WETH.address,
    sellTokenDecimals: WETH.decimals,
    buyToken: USDC.address,
    buyTokenDecimals: USDC.decimals,
    sellAmount: amount.toString(),
    buyAmount: targetBuyAmount.toString(),
    validTo: Math.floor(Date.now() / 1000) + 86400, // valid for 24 hours
  }

  console.log('Posting limit order...')
  const order = await sdk.postLimitOrder(params)
  console.log('Order posted:', order)
  console.log('View order on CowExplorer for Sepolia: https://explorer.cow.fi/sepolia/orders/' + order.orderId)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
