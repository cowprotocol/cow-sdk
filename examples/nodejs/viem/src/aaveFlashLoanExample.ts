import 'dotenv/config'
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'
import { SupportedChainId, TradingSdk, OrderKind, SigningScheme, AccountAddress } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { aaveAdapterFactoryAbi } from './abi/AaveAdapterFactory'
import { collateralSwapAdapterHookAbi } from './abi/CollateralSwapAdapterHook'

const VALID_FOR = 1760030012
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
    oldCollateral: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533', // aGnoWXDAI
    debt: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', // GNO
    newUnderlying: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
    newCollateral: '0xC0333cb85B59a788d8C7CAe5e1Fd6E229A3E5a65', // aUSDC.e
  } as const

  const AAVE_POOL_ADDRESS = '0xb50201558B00496A145fE76f7424749556E326D8' // See https://search.onaave.com/?q=sepolia
  const AAVE_ADAPTER_FACTORY = '0x1186B5ad42E3e6d6c6901FC53b4A367540E6EcFE'
  const AAVE_COLLATERAL_SWAP_ADAPTER_HOOK = '0xe80eE1e73f120b1106179Ae3D582CA4Fd768d517'

  const DEFAULT_GAS_LIMIT = '1000000' // FIXME: This should not be necessary, it should estimate correctly!
  const CHAIN_ID = SupportedChainId.GNOSIS_CHAIN
  const FLASHLOAN_FEE = '10000000000000000' // 0.05% of the flashloan amount
  const OLD_COLLATERAL_AMOUNT = '20000000000000000000'
  const NEW_COLLATERAL_AMOUNT = '18000000'
  const KIND_SELL = '0xf3b277728b3fee749481eb3e0b3b48980dbbab78658fc419025cb16eee346775'

  const owner = account.address
  const amount = 19990000000000000000n
  const slippageBps = 0

  console.log('Owner:', owner)
  console.log('Getting quote...')

  const quoteAndPost = await sdk.getQuote({
    chainId,
    kind: OrderKind.SELL,
    owner,
    amount: amount.toString(),
    sellToken: TOKENS.oldUnderlying,
    sellTokenDecimals: 18,
    buyToken: TOKENS.newUnderlying,
    buyTokenDecimals: 6,
    slippageBps,
  })

  const {
    quoteResults: { orderToSign },
  } = quoteAndPost

  const order = {
    ...orderToSign,
    appData: HashZero,
    validTo: VALID_FOR,
    buyAmount: NEW_COLLATERAL_AMOUNT,
    kind: KIND_SELL,
    sellTokenBalance: '0x5a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9',
    buyTokenBalance: '0x5a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9',
  }

  /////////////////////////////////////////////////////

  const flashLoanParams = {
    borrower: AAVE_ADAPTER_FACTORY,
    lender: AAVE_POOL_ADDRESS,
    flashLoanAsset: TOKENS.oldUnderlying,
    flashLoanAmount: OLD_COLLATERAL_AMOUNT,
    flashLoanFee: FLASHLOAN_FEE,
  }

  const hookAmounts = {
    flashLoanAmount: flashLoanParams.flashLoanAmount,
    flashLoanFeeAmount: flashLoanParams.flashLoanFee,
    sellAssetAmount: OLD_COLLATERAL_AMOUNT,
    buyAssetAmount: NEW_COLLATERAL_AMOUNT,
  }

  const hookOrderData = {
    owner: trader,
    sellAsset: order.sellToken,
    buyAsset: order.buyToken,
    sellAmount: order.sellAmount,
    buyAmount: order.buyAmount,
    kind: order.kind,
    validTo: VALID_FOR, // max value for timestamp expiration for Order
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
    amount: OLD_COLLATERAL_AMOUNT, // this is actually in UNDERLYING but aave tokens are 1:1
    receiver: AAVE_ADAPTER_FACTORY,
    liquidityProvider: AAVE_POOL_ADDRESS,
    protocolAdapter: AAVE_ADAPTER_FACTORY,
    token: TOKENS.oldUnderlying,
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
      validTo: VALID_FOR,
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
