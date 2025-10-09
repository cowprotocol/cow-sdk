import 'dotenv/config'
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'
import { OrderKind, SupportedChainId, TradingSdk } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { AaveFlashLoanSdk } from './AaveFlashLoanSdk'

// =================== Config ===================
const RPC_URL = 'https://rpc.gnosischain.com'
const PRIVATE_KEY = '0x' // private key here (0x...)
// ===============================================================

async function main() {
  const chainId = SupportedChainId.GNOSIS_CHAIN

  if (!PRIVATE_KEY) {
    console.log('Set PRIVATE_KEY to run this example')
    process.exit(0)
  }

  const publicClient = createPublicClient({
    chain: gnosis,
    transport: http(RPC_URL),
  })
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)

  const adapter = new ViemAdapter({ provider: publicClient, signer: account })
  const tradingSdk = new TradingSdk(
    {
      chainId,
      appCode: 'aave-v3-flashloan',
      signer: account,
    },
    {},
    adapter,
  )
  const flashLoanSdk = new AaveFlashLoanSdk(tradingSdk)

  const result = await flashLoanSdk.collateralSwap({
    chainId: SupportedChainId.GNOSIS_CHAIN,
    tradeParameters: {
      sellToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI
      sellTokenDecimals: 18,
      buyToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
      buyTokenDecimals: 6,
      amount: '20000000000000000000',
      kind: OrderKind.SELL,
      validFor: 6 * 60, // 6h
      slippageBps: 0,
    },
    flashLoanFeePercent: 0.05, // 0.05%
  })

  console.log('Posted:', result)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
