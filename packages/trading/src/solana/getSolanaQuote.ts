import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SOLANA_SETTLEMENT_PROGRAM_ID } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { JupiterAPI } from './jupiterApi'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent } from './orderIntent'
import { findOrderPda } from './orderPda'
import { SolanaQuote, SolanaQuoteParameters } from './types'

const DEFAULT_VALID_FOR_SECONDS = 30 * 60
/** No Solana app-data convention exists yet (confirmed absent from the settlement program's intent
 * struct beyond an opaque 32 bytes) — sent as zeroes until one is defined. */
const ZERO_APP_DATA = new Uint8Array(32)

const jupiterApi = new JupiterAPI()

export async function getSolanaQuote(params: SolanaQuoteParameters): Promise<SolanaQuote> {
  const {
    owner,
    sellMint,
    buyMint,
    amount,
    kind,
    partiallyFillable = false,
    validForSeconds = DEFAULT_VALID_FOR_SECONDS,
    sellTokenProgramId = TOKEN_PROGRAM_ID,
    buyTokenProgramId = TOKEN_PROGRAM_ID,
  } = params

  const jupiterOrder = await jupiterApi.getOrder({
    inputMint: sellMint.toBase58(),
    outputMint: buyMint.toBase58(),
    amount: amount.toString(),
    swapMode: kind === OrderKind.SELL ? 'ExactIn' : 'ExactOut',
  })

  const intent: SolanaOrderIntent = {
    owner,
    buyTokenAccount: getAssociatedTokenAddressSync(buyMint, owner, false, buyTokenProgramId),
    buyMint,
    sellTokenAccount: getAssociatedTokenAddressSync(sellMint, owner, false, sellTokenProgramId),
    sellMint,
    sellAmount: BigInt(jupiterOrder.inAmount),
    buyAmount: BigInt(jupiterOrder.outAmount),
    validTo: Math.floor(Date.now() / 1000) + validForSeconds,
    kind,
    partiallyFillable,
    createdOnChain: true,
    appData: ZERO_APP_DATA,
  }

  const intentBytes = encodeOrderIntent(intent)
  const uid = await hashOrderIntent(intentBytes)
  const programId = new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID)
  const [orderPda] = findOrderPda(programId, uid)

  return { intent, intentBytes, uid, orderPda, programId, jupiterOrder }
}
