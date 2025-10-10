import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'

import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { AaveCollateralSwapSdk } from './AaveCollateralSwapSdk'

// =================== Config ===================
const RPC_URL = 'https://rpc.gnosischain.com'
const PRIVATE_KEY = '' // private key here (0x...)
// ===============================================================

describe.skip('AaveFlashLoanIntegration', () => {
  it('Test AaveFlashLoanSdk collateralSwap on Gnosis Chain', async () => {
    const chainId = SupportedChainId.GNOSIS_CHAIN

    if (!PRIVATE_KEY) {
      throw new Error('Set PRIVATE_KEY to run this example')
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
    const flashLoanSdk = new AaveCollateralSwapSdk()

    const result = await flashLoanSdk.collateralSwap(
      {
        chainId: SupportedChainId.GNOSIS_CHAIN,
        tradeParameters: {
          sellToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI
          sellTokenDecimals: 18,
          buyToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
          buyTokenDecimals: 6,
          amount: '20000000000000000000', // 20 WXDAI
          kind: OrderKind.SELL,
          validFor: 10 * 60, // 10m
          slippageBps: 8,
        },
        flashLoanFeePercent: 0.05, // 0.05%
      },
      tradingSdk,
    )

    expect(result).toEqual({ result: 'orderId' })
  }, 20_000)
})
