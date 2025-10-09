import 'dotenv/config'
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'
import {
  SupportedChainId,
  TradingSdk,
  OrderKind,
  SigningScheme,
  AccountAddress,
  OrderSigningUtils,
} from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { aaveAdapterFactoryAbi } from './abi/AaveAdapterFactory'
import { collateralSwapAdapterHookAbi } from './abi/CollateralSwapAdapterHook'
import {
  AAVE_ADAPTER_FACTORY,
  AAVE_COLLATERAL_SWAP_ADAPTER_HOOK,
  AAVE_POOL_ADDRESS,
  EMPTY_PERMIT_SIGN,
  HASH_ZERO,
} from './const'

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
  const trader = account.address

  const adapter = new ViemAdapter({ provider: publicClient, signer: account })
  const sdk = new TradingSdk(
    {
      chainId,
      appCode: 'aave-v3-flashloan',
      signer: account,
    },
    {},
    adapter,
  )

  const TOKENS = {
    oldUnderlying: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI
    newUnderlying: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
  } as const

  const DEFAULT_GAS_LIMIT = '1000000' // FIXME: This should not be necessary, it should estimate correctly!

  const owner = account.address
  const sellAmount = 20000000000000000000n

  const flashloanFeePercent = 0.05 // 0.05%
  const slippageBps = 0
  const validFor = 6 * 60 // 6h
  const validTo = Math.ceil(Date.now() / 1000) + validFor

  const PERCENT_SCALE = 10_000
  const flashLoanFeeAmount = (sellAmount * BigInt(flashloanFeePercent * PERCENT_SCALE)) / BigInt(100 * PERCENT_SCALE)

  console.log('Owner:', owner)
  console.log('Getting quote...')

  const quoteAndPost = await sdk.getQuote({
    chainId,
    kind: OrderKind.SELL,
    owner,
    amount: (sellAmount - flashLoanFeeAmount).toString(),
    sellToken: TOKENS.oldUnderlying,
    sellTokenDecimals: 18,
    buyToken: TOKENS.newUnderlying,
    buyTokenDecimals: 6,
    slippageBps,
    validFor,
  })

  const {
    quoteResults: {
      orderToSign,
      amountsAndCosts: {
        afterSlippage: { buyAmount },
      },
    },
    postSwapOrderFromQuote,
  } = quoteAndPost

  const order: Record<string, string> = {
    ...OrderSigningUtils.encodeUnsignedOrder(orderToSign),
    appData: HASH_ZERO,
    validTo: validTo.toString(),
  }

  const hookAmounts = {
    flashLoanAmount: sellAmount.toString(),
    flashLoanFeeAmount: flashLoanFeeAmount.toString(),
    sellAssetAmount: sellAmount.toString(),
    buyAssetAmount: buyAmount.toString(),
  }

  const hookOrderData = {
    owner: trader,
    sellAsset: order.sellToken,
    buyAsset: order.buyToken,
    sellAmount: order.sellAmount,
    buyAmount: order.buyAmount,
    kind: order.kind,
    validTo, // max value for timestamp expiration for Order
    flashLoanAmount: hookAmounts.flashLoanAmount,
    flashLoanFeeAmount: hookAmounts.flashLoanFeeAmount,
    hookSellAssetAmount: hookAmounts.sellAssetAmount,
    hookBuyAssetAmount: hookAmounts.buyAssetAmount,
  }

  const expectedInstanceAddress = (await adapter.readContract({
    address: AAVE_ADAPTER_FACTORY,
    args: [AAVE_COLLATERAL_SWAP_ADAPTER_HOOK, hookOrderData],
    functionName: 'getInstanceDeterministicAddress',
    abi: aaveAdapterFactoryAbi,
  })) as AccountAddress

  const flashLoanHint = {
    amount: sellAmount.toString(), // this is actually in UNDERLYING but aave tokens are 1:1
    receiver: AAVE_ADAPTER_FACTORY,
    liquidityProvider: AAVE_POOL_ADDRESS,
    protocolAdapter: AAVE_ADAPTER_FACTORY,
    token: orderToSign.sellToken,
  }

  const preHookCallData = adapter.utils.encodeFunction(aaveAdapterFactoryAbi, 'deployAndTransferFlashLoan', [
    trader,
    AAVE_COLLATERAL_SWAP_ADAPTER_HOOK,
    hookAmounts,
    {
      ...order,
      receiver: expectedInstanceAddress,
    },
  ])

  const postHookCallData = adapter.utils.encodeFunction(collateralSwapAdapterHookAbi, 'collateralSwapWithFlashLoan', [
    EMPTY_PERMIT_SIGN,
  ])

  console.log('Posting order...')

  const result = await postSwapOrderFromQuote({
    quoteRequest: {
      validTo,
      receiver: expectedInstanceAddress,
      from: expectedInstanceAddress as AccountAddress,
    },
    additionalParams: {
      signingScheme: SigningScheme.EIP1271,
    },
    appData: {
      metadata: {
        flashloan: flashLoanHint,
        hooks: {
          pre: [
            {
              target: AAVE_ADAPTER_FACTORY,
              callData: preHookCallData,
              gasLimit: DEFAULT_GAS_LIMIT,
            },
          ],
          post: [
            {
              target: expectedInstanceAddress,
              callData: postHookCallData,
              gasLimit: DEFAULT_GAS_LIMIT,
            },
          ],
        },
      },
    },
  })

  console.log('Posted:', result)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
