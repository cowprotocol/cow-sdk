import { PublicKey } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent, toHex } from './orderIntent'
import { SolanaQuote } from './types'

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

async function buildFixtureQuote(): Promise<SolanaQuote> {
  const intent: SolanaOrderIntent = {
    owner: fillPubkey(0x11),
    buyTokenAccount: fillPubkey(0x22),
    buyMint: fillPubkey(0x33),
    sellTokenAccount: fillPubkey(0x44),
    sellMint: fillPubkey(0x55),
    sellAmount: 100n,
    buyAmount: 200n,
    validTo: 1_700_000_000,
    kind: OrderKind.SELL,
    partiallyFillable: false,
    createdOnChain: true,
    appData: new Uint8Array(32),
  }
  const intentBytes = encodeOrderIntent(intent)
  const uid = await hashOrderIntent(intentBytes)

  return {
    intent,
    intentBytes,
    uid,
    orderPda: fillPubkey(0x77),
    programId: fillPubkey(0x01),
    jupiterOrder: {
      inputMint: intent.sellMint.toBase58(),
      outputMint: intent.buyMint.toBase58(),
      inAmount: '100',
      outAmount: '200',
      swapMode: 'ExactIn',
      slippageBps: 0,
    },
  }
}

describe('postSolanaSwapOrderFromQuote', () => {
  it('signs and sends the CreateOrder instruction, returning the hex uid as orderId/txHash', async () => {
    const quote = await buildFixtureQuote()
    const signAndSend = jest.fn().mockResolvedValue({ signature: 'fake-signature' })

    const result = await postSolanaSwapOrderFromQuote(quote, signAndSend)

    expect(signAndSend).toHaveBeenCalledTimes(1)
    const instruction = signAndSend.mock.calls[0][0]
    expect(instruction.programId.toBase58()).toBe(quote.programId.toBase58())
    expect(instruction.data[0]).toBe(2)

    expect(result).toEqual({ orderId: toHex(quote.uid), txHash: 'fake-signature' })
  })

  it('propagates a signAndSend rejection', async () => {
    const quote = await buildFixtureQuote()
    const signAndSend = jest.fn().mockRejectedValue(new Error('user rejected'))

    await expect(postSolanaSwapOrderFromQuote(quote, signAndSend)).rejects.toThrow('user rejected')
  })
})
