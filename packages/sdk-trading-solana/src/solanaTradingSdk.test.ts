import { PublicKey } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

jest.mock('./getSolanaQuote', () => ({
  getSolanaQuote: jest.fn(),
}))
jest.mock('./postSwapOrderFromQuote', () => ({
  postSolanaSwapOrderFromQuote: jest.fn(),
}))

import { getSolanaQuote } from './getSolanaQuote'
import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { SolanaTradingSdk } from './solanaTradingSdk'
import { SolanaQuote } from './types'

const mockGetSolanaQuote = getSolanaQuote as jest.MockedFunction<typeof getSolanaQuote>
const mockPostSolanaSwapOrderFromQuote = postSolanaSwapOrderFromQuote as jest.MockedFunction<
  typeof postSolanaSwapOrderFromQuote
>

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

const owner = fillPubkey(0x11)
const sellMint = fillPubkey(0x22)
const buyMint = fillPubkey(0x33)

const quoteFixture: SolanaQuote = {
  intent: {
    owner,
    buyTokenAccount: fillPubkey(0x44),
    buyMint,
    sellTokenAccount: fillPubkey(0x55),
    sellMint,
    sellAmount: 100n,
    buyAmount: 200n,
    validTo: 1_700_000_000,
    kind: OrderKind.SELL,
    partiallyFillable: false,
    createdOnChain: true,
    appData: new Uint8Array(32),
  },
  intentBytes: new Uint8Array(213),
  uid: new Uint8Array(32),
  orderPda: fillPubkey(0x66),
  programId: fillPubkey(0x77),
  jupiterOrder: {
    inputMint: sellMint.toBase58(),
    outputMint: buyMint.toBase58(),
    inAmount: '100',
    outAmount: '200',
    swapMode: 'ExactIn',
    slippageBps: 0,
  },
}

describe('SolanaTradingSdk', () => {
  beforeEach(() => {
    mockGetSolanaQuote.mockReset()
    mockPostSolanaSwapOrderFromQuote.mockReset()
  })

  it('getQuote delegates to getSolanaQuote with the given params', async () => {
    mockGetSolanaQuote.mockResolvedValue(quoteFixture)
    const signAndSend = jest.fn()
    const sdk = new SolanaTradingSdk({ signAndSend })

    const params = { owner, sellMint, buyMint, amount: 100n, kind: OrderKind.SELL }
    const result = await sdk.getQuote(params)

    expect(mockGetSolanaQuote).toHaveBeenCalledWith(params)
    expect(result.quote).toBe(quoteFixture)
  })

  it('postSwapOrderFromQuote delegates to postSolanaSwapOrderFromQuote with the constructor-bound signAndSend', async () => {
    mockGetSolanaQuote.mockResolvedValue(quoteFixture)
    mockPostSolanaSwapOrderFromQuote.mockResolvedValue({ orderId: 'deadbeef', txHash: 'fake-signature' })
    const signAndSend = jest.fn()
    const sdk = new SolanaTradingSdk({ signAndSend })

    const { postSwapOrderFromQuote } = await sdk.getQuote({
      owner,
      sellMint,
      buyMint,
      amount: 100n,
      kind: OrderKind.SELL,
    })
    const result = await postSwapOrderFromQuote()

    expect(mockPostSolanaSwapOrderFromQuote).toHaveBeenCalledWith(quoteFixture, signAndSend)
    expect(result).toEqual({ orderId: 'deadbeef', txHash: 'fake-signature' })
  })
})
