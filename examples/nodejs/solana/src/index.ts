import bs58 from 'bs58'
import {
  Connection,
  Keypair,
  Transaction,
  TransactionExpiredBlockheightExceededError,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

// =================== Config ===================
const RPC_URL = 'https://solana-rpc.publicnode.com' // mainnet-beta by default — trades real funds
// Base58-encoded secret key (e.g. Phantom/Solflare's "Export Private Key"). This wallet needs SOL
// for fees/rent and a balance of SELL_MINT, on whatever cluster RPC_URL points at.
const PRIVATE_KEY = process.env['PRIVATE_KEY']
// WSOL
const SELL_MINT = 'So11111111111111111111111111111111111111112'
const SELL_MINT_DECIMALS = 9
// USDC
const BUY_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const BUY_MINT_DECIMALS = 6
const DEFAULT_SELL_AMOUNT = '0.001' // SELL_MINT amount, in whole tokens
// ===============================================================


async function main() {
  if (!PRIVATE_KEY) {
    console.log('Set PRIVATE_KEY to run this example: PRIVATE_KEY=xxx pnpm run dev')
    process.exit(0)
  }

  const keypairData = Keypair.fromSeed(Uint8Array.from(bs58.decode(PRIVATE_KEY).slice(0, 32)))

  const owner = Keypair.fromSecretKey(keypairData.secretKey)
  const connection = new Connection(RPC_URL, 'confirmed')

  const sdk = new SolanaTradingSdk()
  const amount = BigInt(Math.round(Number(DEFAULT_SELL_AMOUNT) * 10 ** SELL_MINT_DECIMALS))

  console.log('Owner:', owner.publicKey.toBase58())
  console.log('Getting quote...')
  const { solanaQuote, buildOrder } = await sdk.getQuote({
    ownerAddress: owner.publicKey,
    receiverAddress: owner.publicKey,
    sellTokenAddress: SELL_MINT,
    sellTokenDecimals: SELL_MINT_DECIMALS,
    buyTokenAddress: BUY_MINT,
    buyTokenDecimals: BUY_MINT_DECIMALS,
    amount,
    kind: OrderKind.SELL,
  })
  console.log('Quoted:', {
    sellAmount: solanaQuote.intent.sellAmount.toString(),
    buyAmount: solanaQuote.intent.buyAmount.toString(),
    validTo: solanaQuote.intent.validTo,
  })

  // Step 0: approve the settlement program's delegate on the sell-token account, so the order can
  // actually settle once created. Each settled order decrements the delegate's remaining allowance
  // by the amount transferred, so this is not one-time — a real app should check the existing
  // delegate/allowance first and only reapprove when it's insufficient. This example always
  // approves for exactly this order's sellAmount, which is simpler but wastes a transaction when
  // the existing allowance would already have covered it.
  console.log('Approving settlement program as SPL delegate...')
  const approveInstruction = sdk.approveCowProtocol({
    ownerAddress: owner.publicKey,
    sellTokenAddress: SELL_MINT,
    sellAmount: solanaQuote.intent.sellAmount,
  })

  // Step 2: build the CreateOrder instruction without sending it, so it can be bundled with the
  // approval above into a single atomic transaction.
  console.log('Building CreateOrder instruction...')
  const { instruction, orderId } = await buildOrder()

  console.log('Sending transaction...')
  const transaction = new Transaction().add(approveInstruction, instruction)
  const signature = await sendAndConfirmTransactionResilient(connection, transaction, [owner])

  console.log('Order created:', { orderId, signature })
}

const STATUS_RECHECK_ATTEMPTS = 10
const STATUS_RECHECK_DELAY_MS = 3_000

/**
 * Free/public RPC endpoints are often load-balanced across many backend nodes with no shared, up-to-date
 * view: the node that accepted the transaction can be ahead of the one(s) answering later status
 * requests, so `sendAndConfirmTransaction` reports the blockhash as expired even though the transaction
 * already landed and finalized elsewhere on the cluster. A single extra check right after the failure
 * hits that same inconsistency and is no more reliable than the polling that just failed — only a
 * request that happens to land on a caught-up backend (or that backend catching up) resolves it, so
 * this retries a few times with a delay instead of trusting one recheck.
 */
async function sendAndConfirmTransactionResilient(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[],
): Promise<string> {
  try {
    return await sendAndConfirmTransaction(connection, transaction, signers)
  } catch (e) {
    if (!(e instanceof TransactionExpiredBlockheightExceededError)) throw e

    for (let attempt = 1; attempt <= STATUS_RECHECK_ATTEMPTS; attempt++) {
      const { value: status } = await connection.getSignatureStatus(e.signature, { searchTransactionHistory: true })

      if (status?.err) throw e
      if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
        console.log('Confirmation polling lagged behind the network, but the transaction landed and finalized.')
        return e.signature
      }

      console.log(`Rechecking on-chain status (${attempt}/${STATUS_RECHECK_ATTEMPTS})...`)
      await new Promise((resolve) => setTimeout(resolve, STATUS_RECHECK_DELAY_MS))
    }

    throw e
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
