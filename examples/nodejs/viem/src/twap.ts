import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import {
  SupportedChainId,
  OrderBookApi,
  buildAppData,
  COMPOSABLE_COW_CONTRACT_ADDRESS,
  WRAPPED_NATIVE_CURRENCIES,
  setGlobalAdapter,
} from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
// NOTE: Twap is NOT re-exported by `@cowprotocol/cow-sdk` — import it from the composable package.
import { Twap, TwapData, StartTimeValue, DurationType } from '@cowprotocol/sdk-composable'
import Safe from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import { OperationType } from '@safe-global/types-kit'

// =================== Config ===================
const RPC_URL = 'https://0xrpc.io/sep'
const PRIVATE_KEY = '' // a Safe owner's private key (0x...)
const SAFE_ADDRESS = '' // the Safe that will own the TWAP order
const SAFE_API_KEY = '' // Safe Transaction Service API key, see https://docs.safe.global
const APP_CODE = 'CoWSdkNodeExampleViem'
// ===============================================================

/**
 * A TWAP is a ComposableCoW *conditional order*, not an off-chain order, so there is no
 * `sdk.postTwapOrder()`. The flow is:
 *   1. Use TradingSdk to set up the adapter/signer and build + upload the app-data.
 *   2. Build the order with `Twap.fromData(twapData)`.
 *   3. Submit `twap.createCalldata` to the ComposableCoW contract *from a Safe* — TWAP orders
 *      only become live when msg.sender is a smart-contract wallet with ComposableCoW as its
 *      fallback handler. The watch-tower then posts each part to the order book.
 *
 * This example submits the create transaction through the Safe Transaction Service using
 * @safe-global/protocol-kit + @safe-global/api-kit: it proposes the transaction and, for a
 * 1/1 Safe, executes it immediately. For a multisig, other owners confirm via
 * `apiKit.confirmTransaction(safeTxHash, signature.data)` before it can be executed.
 */
async function main() {
  const chainId = SupportedChainId.SEPOLIA

  if (!PRIVATE_KEY || !SAFE_ADDRESS || !SAFE_API_KEY) {
    console.log('Set PRIVATE_KEY, SAFE_ADDRESS, and SAFE_API_KEY to run this example')
    process.exit(0)
  }

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  })

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)

  const adapter = new ViemAdapter({ provider: publicClient, signer: account })

  setGlobalAdapter(adapter)

  const orderBookApi = new OrderBookApi({ chainId })

  console.log('Safe (order owner):', SAFE_ADDRESS)

  // 1. Build the app-data (TradingSdk helper) and upload it so the watch-tower
  //    can attach it to each TWAP part.
  const { appDataKeccak256, fullAppData } = await buildAppData({
    appCode: APP_CODE,
    slippageBps: 0,
    orderClass: 'twap',
  })
  await orderBookApi.uploadAppData(appDataKeccak256, fullAppData)
  console.log('Uploaded app-data:', appDataKeccak256)

  // 2. Build the TWAP with Twap.fromData().
  //    sellAmount / buyAmount are the TOTALS across all parts; the class divides
  //    them by numberOfParts internally (partSellAmount = sellAmount / n, etc).
  //    The order owner / receiver is the Safe.
  const WETH = WRAPPED_NATIVE_CURRENCIES[chainId]
  const USDC = { address: '0xbe72E441BF55620febc26715db68d3494213D8Cb', decimals: 18 }

  const twapData: TwapData = {
    sellToken: WETH.address,
    buyToken: USDC.address,
    receiver: SAFE_ADDRESS,
    sellAmount: 1_000_000_000_000_000_000n, // 1.0 WETH total, sold over all parts
    buyAmount: 900_000_000_000_000_000n, // 0.9 USDC total min received
    numberOfParts: 10n, // 10 parts
    timeBetweenParts: 3600n, // 1h between parts
    startTime: { startType: StartTimeValue.AT_MINING_TIME },
    durationOfPart: { durationType: DurationType.AUTO }, // each part open for the full interval
    appData: appDataKeccak256,
  }

  const twap = Twap.fromData(twapData)

  // Sanity-check before sending on chain.
  const validity = twap.isValid()
  if (!validity.isValid) throw new Error(`Invalid TWAP: ${validity.reason}`)

  // 3. Submit the order to ComposableCoW through the Safe. `createCalldata` encodes
  //    create / createWithContext automatically (AT_MINING_TIME needs the timestamp factory).
  const protocolKit = await Safe.init({
    provider: RPC_URL,
    signer: PRIVATE_KEY,
    safeAddress: SAFE_ADDRESS,
  })
  const apiKit = new SafeApiKit({ chainId: BigInt(chainId), apiKey: SAFE_API_KEY })

  const safeTransaction = await protocolKit.createTransaction({
    transactions: [
      {
        to: COMPOSABLE_COW_CONTRACT_ADDRESS[chainId],
        value: '0',
        data: twap.createCalldata,
        operation: OperationType.Call,
      },
    ],
  })

  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)
  const senderSignature = await protocolKit.signHash(safeTxHash)

  // Propose the transaction to the Safe Transaction Service.
  await apiKit.proposeTransaction({
    safeAddress: SAFE_ADDRESS,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: account.address,
    senderSignature: senderSignature.data,
  })
  console.log('Proposed Safe transaction:', safeTxHash)

  // For a 1/1 Safe we can execute right away. For a multisig, collect the remaining
  // confirmations first (other owners call apiKit.confirmTransaction(safeTxHash, sig)).
  const { threshold } = await apiKit.getSafeInfo(SAFE_ADDRESS)
  if (threshold <= 1) {
    const signedTx = await apiKit.getTransaction(safeTxHash)
    const executeTxResponse = await protocolKit.executeTransaction(signedTx)
    console.log('TWAP created. Order id:', twap.id, 'tx:', executeTxResponse.hash)
  } else {
    console.log(
      `Safe requires ${threshold} confirmations. Order id: ${twap.id}. ` +
        `Remaining owners must confirm ${safeTxHash} before it can be executed.`,
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
