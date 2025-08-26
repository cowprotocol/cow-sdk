import 'dotenv/config'
import { JsonRpcProvider, Wallet } from 'ethers'
import {
  setGlobalAdapter,
  SupportedChainId,
  TradingSdk,
  OrderKind,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'

// =================== Config ===================
const RPC_URL = 'https://sepolia.gateway.tenderly.co'
const PRIVATE_KEY = '0x' // private key here (0x...)
const DEFAULT_SELL_AMOUNT = '0.1' // WETH amount
// ===============================================================

async function main() {
  const chainId = SupportedChainId.SEPOLIA

  if (!PRIVATE_KEY) {
    console.log('Set PRIVATE_KEY to run this example')
    process.exit(0)
  }

  const provider = new JsonRpcProvider(RPC_URL, chainId)
  const wallet = new Wallet(PRIVATE_KEY, provider)

  const adapter = new EthersV6Adapter({ provider, signer: wallet })
  setGlobalAdapter(adapter)

  const sdk = new TradingSdk({
    chainId,
    appCode: 'CoWSdkNodeExampleEthers6',
    signer: wallet,
  })

  const WETH = WRAPPED_NATIVE_CURRENCIES[chainId]
  const USDC = { address: '0xbe72E441BF55620febc26715db68d3494213D8Cb', decimals: 18 }

  const owner = (await wallet.getAddress()) as `0x${string}`
  const amount = Math.round(Number(DEFAULT_SELL_AMOUNT) * 10 ** WETH.decimals).toString()
  const slippageBps = 50

  console.log('Owner:', owner)
  console.log('Getting quote...')
  const quoteAndPost = await sdk.getQuote({
    chainId,
    kind: OrderKind.SELL,
    owner,
    amount,
    sellToken: WETH.address,
    sellTokenDecimals: WETH.decimals,
    buyToken: USDC.address,
    buyTokenDecimals: USDC.decimals,
    slippageBps,
  })

  console.log('Posting order...')
  const res = await quoteAndPost.postSwapOrderFromQuote({})
  console.log('Posted:', res)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
