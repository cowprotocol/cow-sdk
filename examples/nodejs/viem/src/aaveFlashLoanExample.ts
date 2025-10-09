import 'dotenv/config'
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'
import { SupportedChainId, TradingSdk, OrderKind, SigningScheme, AccountAddress } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { aaveAdapterFactoryAbi } from './abi/AaveAdapterFactory'
import { collateralSwapAdapterHookAbi } from './abi/CollateralSwapAdapterHook'

// =================== Config ===================
const RPC_URL = 'https://rpc.gnosischain.com'
const PRIVATE_KEY = '0x' // private key here (0x...)
// ===============================================================

const HashZero = '0x0000000000000000000000000000000000000000000000000000000000000000'

function getEmptyPermitSig() {
  return {
    amount: 0,
    deadline: 0,
    v: 0,
    r: HashZero, // bytes32(0) in Solidity
    s: HashZero, // bytes32(0) in Solidity
  }
}

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

  const AAVE_POOL_ADDRESS = '0xb50201558B00496A145fE76f7424749556E326D8' // See https://search.onaave.com/?q=sepolia
  const AAVE_ADAPTER_FACTORY = '0x1186B5ad42E3e6d6c6901FC53b4A367540E6EcFE'
  const AAVE_COLLATERAL_SWAP_ADAPTER_HOOK = '0xe80eE1e73f120b1106179Ae3D582CA4Fd768d517'

  const DEFAULT_GAS_LIMIT = '1000000' // FIXME: This should not be necessary, it should estimate correctly!

  const FLASHLOAN_FEE_PERCENT = 0.05 // 0.05%
  const KIND_SELL = '0xf3b277728b3fee749481eb3e0b3b48980dbbab78658fc419025cb16eee346775'

  const owner = account.address
  const sellAmount = 20000000000000000000n
  const slippageBps = 0
  const validFor = 6 * 60 // 6h
  const validTo = Math.ceil(Date.now() / 1000) + validFor

  const PERCENT_SCALE = 10_000
  const flashLoanFeeAmount = (sellAmount * BigInt(FLASHLOAN_FEE_PERCENT * PERCENT_SCALE)) / BigInt(100 * PERCENT_SCALE)

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
  } = quoteAndPost

  const order = {
    ...orderToSign,
    appData: HashZero,
    validTo,
    buyAmount: buyAmount.toString(),
    kind: KIND_SELL,
    sellTokenBalance: '0x5a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9',
    buyTokenBalance: '0x5a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9',
  }

  /////////////////////////////////////////////////////

  const flashLoanParams = {
    borrower: AAVE_ADAPTER_FACTORY,
    lender: AAVE_POOL_ADDRESS,
    flashLoanAsset: orderToSign.sellToken,
    flashLoanAmount: sellAmount.toString(),
    flashLoanFee: flashLoanFeeAmount.toString(),
  }

  const hookAmounts = {
    flashLoanAmount: flashLoanParams.flashLoanAmount,
    flashLoanFeeAmount: flashLoanParams.flashLoanFee,
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
    args: [AAVE_COLLATERAL_SWAP_ADAPTER_HOOK, hookOrderData as any],
    functionName: 'getInstanceDeterministicAddress',
    abi: aaveAdapterFactoryAbi,
  })) as string

  order.receiver = expectedInstanceAddress

  console.log('expectedInstanceAddress', expectedInstanceAddress)

  const flashLoanHint = {
    amount: sellAmount.toString(), // this is actually in UNDERLYING but aave tokens are 1:1
    receiver: AAVE_ADAPTER_FACTORY,
    liquidityProvider: AAVE_POOL_ADDRESS,
    protocolAdapter: AAVE_ADAPTER_FACTORY,
    token: orderToSign.sellToken,
  }
  console.log('flashLoanHint', flashLoanHint)

  const preHookCalldata = adapter.utils.encodeFunction(aaveAdapterFactoryAbi, 'deployAndTransferFlashLoan', [
    trader,
    AAVE_COLLATERAL_SWAP_ADAPTER_HOOK,
    hookAmounts as any,
    order,
  ])

  const postHookCalldata = adapter.utils.encodeFunction(collateralSwapAdapterHookAbi, 'collateralSwapWithFlashLoan', [
    getEmptyPermitSig() as any,
  ])
  /////////////////////////////////////////////////////

  console.log('Posting order...')

  const result = await sdk.postLimitOrder(
    {
      ...order,
      kind: orderToSign.kind,
      sellTokenDecimals: 18,
      buyTokenDecimals: 6,
      validTo,
      receiver: expectedInstanceAddress,
      slippageBps,
      owner: expectedInstanceAddress as AccountAddress,
    },
    {
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
                callData: preHookCalldata,
                gasLimit: DEFAULT_GAS_LIMIT,
              },
            ],
            post: [
              {
                target: expectedInstanceAddress,
                callData: postHookCalldata,
                gasLimit: DEFAULT_GAS_LIMIT,
              },
            ],
          },
        },
      },
    },
  )

  console.log('Posted:', result)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
