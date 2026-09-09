import { PublicKey } from '@solana/web3.js'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import type {
  OrderPostingResult,
  QuoteResults,
  SigningStepManager,
  SwapAdvancedSettings,
} from '@cowprotocol/sdk-trading'

jest.mock('./getSolanaQuote', () => ({
  getSolanaQuote: jest.fn(),
}))
jest.mock('./postSwapOrderFromQuote', () => ({
  postSolanaSwapOrderFromQuote: jest.fn(),
}))
jest.mock('./buildSwapOrder', () => ({
  buildSolanaSwapOrder: jest.fn(),
}))

import { buildSolanaSwapOrder, SolanaSwapOrder } from './buildSwapOrder'
import { getSolanaQuote } from './getSolanaQuote'
import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { SolanaTradingSdk } from './solanaTradingSdk'
import { SolanaQuote, SolanaQuoteParameters } from './types'

const mockGetSolanaQuote = getSolanaQuote as jest.MockedFunction<typeof getSolanaQuote>
const mockPostSolanaSwapOrderFromQuote = postSolanaSwapOrderFromQuote as jest.MockedFunction<
  typeof postSolanaSwapOrderFromQuote
>
const mockBuildSolanaSwapOrder = buildSolanaSwapOrder as jest.MockedFunction<typeof buildSolanaSwapOrder>

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

const owner = fillPubkey(0x11)
const receiver = fillPubkey(0x99)
const sellMint = fillPubkey(0x22)
const buyMint = fillPubkey(0x33)

const params: SolanaQuoteParameters = {
  ownerAddress: owner,
  receiverAddress: receiver,
  sellTokenAddress: sellMint,
  sellTokenDecimals: 6,
  buyTokenAddress: buyMint,
  buyTokenDecimals: 9,
  amount: 100n,
  kind: OrderKind.SELL,
}

const solanaQuoteFixture: SolanaQuote = {
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

const quoteResultsFixture = { fake: 'quoteResults' } as unknown as QuoteResults

const quoteFixture = { quoteResults: quoteResultsFixture, solanaQuote: solanaQuoteFixture }

const orderPostingResultFixture: OrderPostingResult = {
  orderId: 'deadbeef',
  txHash: 'fake-signature',
  signature: 'fake-signature',
  signingScheme: SigningScheme.PRESIGN,
  orderToSign: {} as OrderPostingResult['orderToSign'],
}

const swapOrderFixture = { orderId: 'deadbeef' } as SolanaSwapOrder

describe('SolanaTradingSdk', () => {
  beforeEach(() => {
    mockGetSolanaQuote.mockReset()
    mockPostSolanaSwapOrderFromQuote.mockReset()
    mockBuildSolanaSwapOrder.mockReset()
    mockGetSolanaQuote.mockResolvedValue(quoteFixture)
  })

  it('getQuote delegates to getSolanaQuote with the given params', async () => {
    const sdk = new SolanaTradingSdk()

    const result = await sdk.getQuote(params)

    expect(mockGetSolanaQuote).toHaveBeenCalledWith(params, { env: undefined })
    expect(result.quoteResults).toBe(quoteResultsFixture)
  })

  it('getQuote forwards the constructor-bound env to getSolanaQuote', async () => {
    const sdk = new SolanaTradingSdk({ env: 'staging' })

    await sdk.getQuote(params)

    expect(mockGetSolanaQuote).toHaveBeenCalledWith(params, { env: 'staging' })
  })

  it('getQuote exposes solanaQuote, so callers can inspect the intent and PDA', async () => {
    const sdk = new SolanaTradingSdk()

    const result = await sdk.getQuote(params)

    expect(result.solanaQuote).toBe(solanaQuoteFixture)
  })

  it('buildOrder delegates to buildSolanaSwapOrder without needing a signer', async () => {
    mockBuildSolanaSwapOrder.mockResolvedValue(swapOrderFixture)
    const sdk = new SolanaTradingSdk()

    const { buildOrder } = await sdk.getQuote(params)
    const order = await buildOrder()

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(quoteFixture, undefined)
    expect(order).toBe(swapOrderFixture)
  })

  it('buildOrder forwards advancedSettings', async () => {
    mockBuildSolanaSwapOrder.mockResolvedValue(swapOrderFixture)
    const advancedSettings: SwapAdvancedSettings = { quoteRequest: { validTo: 1_800_000_000 } }
    const sdk = new SolanaTradingSdk()

    const { buildOrder } = await sdk.getQuote(params)
    await buildOrder(advancedSettings)

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(quoteFixture, advancedSettings)
  })

  it('postSwapOrderFromQuote takes signAndSend per call, not at construction', async () => {
    mockPostSolanaSwapOrderFromQuote.mockResolvedValue(orderPostingResultFixture)
    const signAndSend = jest.fn()
    const sdk = new SolanaTradingSdk()

    const { postSwapOrderFromQuote } = await sdk.getQuote(params)
    const result = await postSwapOrderFromQuote(signAndSend)

    expect(mockPostSolanaSwapOrderFromQuote).toHaveBeenCalledWith(quoteFixture, signAndSend, undefined, undefined)
    expect(result).toEqual(orderPostingResultFixture)
  })

  it('postSwapOrderFromQuote forwards advancedSettings and signingStepManager', async () => {
    mockPostSolanaSwapOrderFromQuote.mockResolvedValue(orderPostingResultFixture)
    const signAndSend = jest.fn()
    const sdk = new SolanaTradingSdk()
    const advancedSettings: SwapAdvancedSettings = { quoteRequest: { validTo: 1_800_000_000 } }
    const signingStepManager: SigningStepManager = { beforeOrderSign: jest.fn() }

    const { postSwapOrderFromQuote } = await sdk.getQuote(params)
    await postSwapOrderFromQuote(signAndSend, advancedSettings, signingStepManager)

    expect(mockPostSolanaSwapOrderFromQuote).toHaveBeenCalledWith(
      quoteFixture,
      signAndSend,
      advancedSettings,
      signingStepManager,
    )
  })
})
