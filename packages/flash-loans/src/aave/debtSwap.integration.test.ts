import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'

import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { getOrderToSign, LimitTradeParameters, TradingSdk } from '@cowprotocol/sdk-trading'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { AaveCollateralSwapSdk } from './AaveCollateralSwapSdk'
import { AccountAddress } from '@cowprotocol/sdk-common'
import { AaveFlashLoanType, HASH_ZERO } from './const'

// =================== Config ===================
const RPC_URL = 'https://rpc.gnosis.gateway.fm'
const PRIVATE_KEY = process.env.PRIVATE_KEY
// ===============================================================

describe('AaveFlashLoanIntegration.debtSwap', () => {
  it.skip('Test AaveFlashLoanSdk debtSwap on Gnosis Chain with limit order', async () => {
    const chainId = SupportedChainId.GNOSIS_CHAIN

    if (!PRIVATE_KEY) {
      throw new Error('Set PRIVATE_KEY to run this example')
    }

    const publicClient = createPublicClient({
      chain: gnosis,
      transport: http(RPC_URL),
    })
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)
    const appCode = 'aave-v3-flashloan'

    const adapter = new ViemAdapter({ provider: publicClient, signer: account })
    const tradingSdk = new TradingSdk(
      {
        chainId,
        appCode,
        signer: account,
        env: 'staging',
      },
      {},
      adapter,
    )
    const flashLoanSdk = new AaveCollateralSwapSdk()

    const owner = (await adapter.signer.getAddress()) as AccountAddress
    const sellAmount = 2000000n // 2 USDC.e
    // The amount is before slippage and partner fee!
    const buyAmount = 11000000000000000n // 0.011 GNO
    const validTo = Math.ceil(Date.now() / 1000) + 10 * 60 // 10m
    const flashLoanFeeBps = 5 // 0.05%

    // Set true if you sell native token
    const isEthFlow = false
    const collateralPermit = undefined

    const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
      flashLoanFeeBps,
      sellAmount,
    })

    const limitOrder: LimitTradeParameters = {
      sellToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
      sellTokenDecimals: 6,
      buyToken: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', // GNO
      buyTokenDecimals: 18,
      sellAmount: sellAmountToSign.toString(),
      buyAmount: buyAmount.toString(),
      kind: OrderKind.BUY,
      validTo,
      slippageBps: 0,
      partnerFee: undefined,
    }

    const orderToSign = getOrderToSign(
      { chainId, from: owner, networkCostsAmount: '0', isEthFlow },
      limitOrder,
      HASH_ZERO,
    )

    const orderPostParams = await flashLoanSdk.getOrderPostingSettings(
      AaveFlashLoanType.DebtSwap,
      {
        chainId,
        validTo,
        owner,
        flashLoanFeeAmount,
      },
      {
        sellAmount,
        buyAmount,
        orderToSign,
        collateralPermit,
      },
    )

    try {
      const result = await tradingSdk.postLimitOrder(limitOrder, orderPostParams.swapSettings)

      expect(result).toEqual({ result: 'orderId' })
    } catch (error) {
      expect((error as { body: unknown }).body || error).toEqual({})
    }
  }, 120_000)
})
