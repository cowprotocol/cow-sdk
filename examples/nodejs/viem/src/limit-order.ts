import 'dotenv/config'
import { createPublicClient, http, parseUnits } from 'viem'
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

  // const approvedAmount = await sdk.getCowProtocolAllowance({
  //   tokenAddress: WETH.address,
  //   owner,
  // })

  // console.log('Checking ...')
  // if (approvedAmount < amount) {
  //   console.log('Approving Cow Protocol...')
  //   try {
  //     const approvalTxHash = await sdk.approveCowProtocol({
  //       tokenAddress: WETH.address,
  //       amount: amount,
  //     })

  //     const res = await publicClient.waitForTransactionReceipt({ hash: approvalTxHash as Hash })
  //     console.log('Approved:', res)
  //   } catch (e) {
  //     console.error('Approval tx failed:', e)
  //     process.exit(1)
  //   }
  // } else {
  //   console.log('Already approved Cow Protocol for swap amount')
  // }

  console.log('Owner:', owner)
  console.log('Getting quote...')

  const params: LimitTradeParameters = {
    // from TradeBaseParameters
    kind: OrderKind.SELL, // or OrderKind.BUY
    sellToken: '0xYourSellToken',
    sellTokenDecimals: 18,
    buyToken: '0xYourBuyToken',
    buyTokenDecimals: 6,

    // from LimitTradeParameters
    sellAmount: amount.toString(),
    buyAmount: parseUnits('300', 6).toString(), // this is your limit price
    validTo: Math.floor(Date.now() / 1000) + 3600, // 1hr from now, in seconds
    quoteId: undefined, // optional, can omit entirely
  }

  const order = sdk.postLimitOrder(params)
  console.log('Order posted:', order)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
