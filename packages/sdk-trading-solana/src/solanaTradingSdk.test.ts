import { PublicKey } from '@solana/web3.js'
import { decodeApproveInstruction, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import type {
  OrderPostingResult,
  QuoteResults,
  SigningStepManager,
  SwapAdvancedSettings,
} from '@cowprotocol/sdk-trading'
import { getSolanaDelegateAuthority, getSolanaSettlementProgramId } from './statePda'

jest.mock('./getSolanaQuote', () => ({
  getSolanaQuote: jest.fn(),
}))
jest.mock('./postSwapOrderFromQuote', () => ({
  postSolanaSwapOrderFromQuote: jest.fn(),
}))
jest.mock('./buildSwapOrder', () => ({
  buildSolanaSwapOrder: jest.fn(),
}))
jest.mock('./postSponsoredOrder', () => ({
  postSolanaSponsoredOrder: jest.fn(),
}))
jest.mock('./buildLimitOrder', () => ({
  buildSolanaLimitOrderOrder: jest.fn(),
}))

import { buildSolanaLimitOrderOrder, SolanaLimitOrderParams } from './buildLimitOrder'
import { buildSolanaSwapOrder, SolanaSwapOrder } from './buildSwapOrder'
import { getSolanaQuote } from './getSolanaQuote'
import { postSolanaSponsoredOrder } from './postSponsoredOrder'
import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { SolanaTradingSdk } from './solanaTradingSdk'
import { SolanaQuote, SolanaQuoteParameters } from './types'

const mockGetSolanaQuote = getSolanaQuote as jest.MockedFunction<typeof getSolanaQuote>
const mockPostSolanaSwapOrderFromQuote = postSolanaSwapOrderFromQuote as jest.MockedFunction<
  typeof postSolanaSwapOrderFromQuote
>
const mockBuildSolanaSwapOrder = buildSolanaSwapOrder as jest.MockedFunction<typeof buildSolanaSwapOrder>
const mockPostSolanaSponsoredOrder = postSolanaSponsoredOrder as jest.MockedFunction<typeof postSolanaSponsoredOrder>
const mockBuildSolanaLimitOrderOrder = buildSolanaLimitOrderOrder as jest.MockedFunction<
  typeof buildSolanaLimitOrderOrder
>

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
}

const quoteResultsFixture = { fake: 'quoteResults', quoteResponse: { id: 7 } } as unknown as QuoteResults

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
    mockPostSolanaSponsoredOrder.mockReset()
    mockBuildSolanaLimitOrderOrder.mockReset()
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

  it('getQuote forwards advancedSettings to getSolanaQuote', async () => {
    const sdk = new SolanaTradingSdk()
    const getSlippageSuggestion = jest.fn()
    const advancedSettings: SwapAdvancedSettings = { getSlippageSuggestion }

    await sdk.getQuote(params, advancedSettings)

    expect(mockGetSolanaQuote).toHaveBeenCalledWith(params, { env: undefined, advancedSettings })
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

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(quoteFixture, undefined, undefined)
    expect(order).toBe(swapOrderFixture)
  })

  // The sponsor is a deployment-level address the caller learns at order time, not something the SDK
  // can be constructed with.
  it('buildOrder forwards a per-call sponsor', async () => {
    mockBuildSolanaSwapOrder.mockResolvedValue(swapOrderFixture)
    const sponsor = fillPubkey(0xaa)
    const sdk = new SolanaTradingSdk()

    const { buildOrder } = await sdk.getQuote(params)
    await buildOrder(undefined, { sponsor })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(quoteFixture, undefined, { sponsor })
  })

  it('buildOrder forwards advancedSettings', async () => {
    mockBuildSolanaSwapOrder.mockResolvedValue(swapOrderFixture)
    const advancedSettings: SwapAdvancedSettings = { quoteRequest: { validTo: 1_800_000_000 } }
    const sdk = new SolanaTradingSdk()

    const { buildOrder } = await sdk.getQuote(params)
    await buildOrder(advancedSettings)

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(quoteFixture, advancedSettings, undefined)
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

  it('postSponsoredOrder ties the order back to this quote', async () => {
    mockPostSolanaSponsoredOrder.mockResolvedValue('0xdeadbeef')
    const sdk = new SolanaTradingSdk({ env: 'staging' })

    const { postSponsoredOrder } = await sdk.getQuote(params)
    const uid = await postSponsoredOrder('AQABAgMEBQY=')

    expect(mockPostSolanaSponsoredOrder).toHaveBeenCalledWith(
      { transaction: 'AQABAgMEBQY=', quoteId: 7 },
      { env: 'staging', orderBookApi: undefined },
    )
    expect(uid).toBe('0xdeadbeef')
  })

  // The endpoint answers `id: null` when it could not store the quote; posting that null back would be
  // a claim about a quote that does not exist.
  it('postSponsoredOrder omits the quoteId when the quote was not stored', async () => {
    mockGetSolanaQuote.mockResolvedValue({
      ...quoteFixture,
      quoteResults: { quoteResponse: { id: null } } as unknown as QuoteResults,
    })
    const sdk = new SolanaTradingSdk()

    const { postSponsoredOrder } = await sdk.getQuote(params)
    await postSponsoredOrder('AQABAgMEBQY=')

    expect(mockPostSolanaSponsoredOrder).toHaveBeenCalledWith(
      { transaction: 'AQABAgMEBQY=', quoteId: undefined },
      expect.anything(),
    )
  })

  describe('buildLimitOrder', () => {
    const limitOrderParams: SolanaLimitOrderParams = {
      ownerAddress: owner,
      sellTokenAddress: sellMint,
      buyTokenAddress: buyMint,
      sellAmount: 1_000_000n,
      buyAmount: 999_000n,
      kind: OrderKind.SELL,
      validTo: 1_700_000_000,
      partiallyFillable: false,
      appData: new Uint8Array(32).fill(0xab),
    }

    it('delegates to buildSolanaLimitOrderOrder with the given params', async () => {
      mockBuildSolanaLimitOrderOrder.mockResolvedValue(swapOrderFixture)
      const sdk = new SolanaTradingSdk()

      const order = await sdk.buildLimitOrder(limitOrderParams)

      expect(mockBuildSolanaLimitOrderOrder).toHaveBeenCalledWith({ env: undefined, ...limitOrderParams })
      expect(order).toBe(swapOrderFixture)
    })

    it('forwards the constructor-bound env to buildSolanaLimitOrderOrder', async () => {
      mockBuildSolanaLimitOrderOrder.mockResolvedValue(swapOrderFixture)
      const sdk = new SolanaTradingSdk({ env: 'staging' })

      await sdk.buildLimitOrder(limitOrderParams)

      expect(mockBuildSolanaLimitOrderOrder).toHaveBeenCalledWith({ ...limitOrderParams, env: 'staging' })
    })

    it("lets params.env override the SDK's constructor-bound env", async () => {
      mockBuildSolanaLimitOrderOrder.mockResolvedValue(swapOrderFixture)
      const sdk = new SolanaTradingSdk({ env: 'staging' })

      await sdk.buildLimitOrder({ ...limitOrderParams, env: 'prod' })

      expect(mockBuildSolanaLimitOrderOrder).toHaveBeenCalledWith({ ...limitOrderParams, env: 'prod' })
    })
  })

  describe('approveCowProtocol', () => {
    it('builds an approve instruction delegating the sell-token account to the settlement authority', () => {
      const sdk = new SolanaTradingSdk()

      const instruction = sdk.approveCowProtocol({
        ownerAddress: owner,
        sellTokenAddress: sellMint,
        approveAmount: 123n,
      })

      const decoded = decodeApproveInstruction(instruction)
      expect(decoded.keys.account.pubkey).toEqual(getAssociatedTokenAddressSync(sellMint, owner))
      expect(decoded.keys.delegate.pubkey).toEqual(getSolanaDelegateAuthority())
      expect(decoded.keys.owner.pubkey).toEqual(owner)
      expect(decoded.keys.owner.isSigner).toBe(true)
      expect(decoded.data.amount).toBe(123n)
    })

    it('uses the constructor-bound env to resolve the delegate authority', () => {
      const sdk = new SolanaTradingSdk({ env: 'staging' })

      const instruction = sdk.approveCowProtocol({
        ownerAddress: owner,
        sellTokenAddress: sellMint,
        approveAmount: 123n,
      })

      const decoded = decodeApproveInstruction(instruction)
      expect(decoded.keys.delegate.pubkey).toEqual(getSolanaDelegateAuthority('staging'))
    })

    it('derives the associated token account under the given token program for Token-2022 mints', () => {
      const sdk = new SolanaTradingSdk()

      const instruction = sdk.approveCowProtocol({
        ownerAddress: owner,
        sellTokenAddress: sellMint,
        approveAmount: 123n,
        sellTokenProgramId: TOKEN_2022_PROGRAM_ID,
      })

      const decoded = decodeApproveInstruction(instruction, TOKEN_2022_PROGRAM_ID)
      expect(decoded.keys.account.pubkey).toEqual(
        getAssociatedTokenAddressSync(sellMint, owner, false, TOKEN_2022_PROGRAM_ID),
      )
      expect(instruction.programId).toEqual(TOKEN_2022_PROGRAM_ID)
    })
  })

  describe('cancelOrder', () => {
    const orderPda = fillPubkey(0x88)

    it('builds a cancel instruction against the resolved settlement program', () => {
      const sdk = new SolanaTradingSdk()

      const instruction = sdk.cancelOrder({ ownerAddress: owner, orderPda })

      expect(instruction.programId).toEqual(getSolanaSettlementProgramId())
      expect(instruction.data).toEqual(Buffer.from([11]))
      expect(instruction.keys).toEqual([
        { pubkey: owner, isSigner: true, isWritable: false },
        { pubkey: owner, isSigner: false, isWritable: false },
        { pubkey: orderPda, isSigner: false, isWritable: true },
        expect.objectContaining({ isSigner: false, isWritable: false }),
      ])
    })

    it('uses the constructor-bound env to resolve the settlement program', () => {
      const sdk = new SolanaTradingSdk({ env: 'staging' })

      const instruction = sdk.cancelOrder({ ownerAddress: owner, orderPda })

      expect(instruction.programId).toEqual(getSolanaSettlementProgramId('staging'))
    })

    it('encodes the intent and makes createdBy a writable signer when creating an already-cancelled order', () => {
      const sdk = new SolanaTradingSdk()
      const createdBy = fillPubkey(0xbb)

      const instruction = sdk.cancelOrder({
        ownerAddress: owner,
        orderPda,
        intent: solanaQuoteFixture.intent,
        createdByAddress: createdBy,
      })

      expect(instruction.data.length).toBe(1 + 213)
      expect(instruction.keys).toEqual([
        { pubkey: owner, isSigner: true, isWritable: false },
        { pubkey: createdBy, isSigner: true, isWritable: true },
        { pubkey: orderPda, isSigner: false, isWritable: true },
        expect.objectContaining({ isSigner: false, isWritable: false }),
      ])
    })
  })

  describe('cancelOrders', () => {
    it('builds one CancelOrder instruction per entry, in order', () => {
      const sdk = new SolanaTradingSdk()
      const orderPdaA = fillPubkey(0x88)
      const orderPdaB = fillPubkey(0x89)
      const createdBy = fillPubkey(0xbb)

      const instructions = sdk.cancelOrders([
        { ownerAddress: owner, orderPda: orderPdaA },
        { ownerAddress: owner, orderPda: orderPdaB, intent: solanaQuoteFixture.intent, createdByAddress: createdBy },
      ])

      expect(instructions).toHaveLength(2)
      expect(instructions[0]).toEqual(sdk.cancelOrder({ ownerAddress: owner, orderPda: orderPdaA }))
      expect(instructions[1]).toEqual(
        sdk.cancelOrder({
          ownerAddress: owner,
          orderPda: orderPdaB,
          intent: solanaQuoteFixture.intent,
          createdByAddress: createdBy,
        }),
      )
    })

    it('returns an empty array for an empty list', () => {
      const sdk = new SolanaTradingSdk()

      expect(sdk.cancelOrders([])).toEqual([])
    })
  })
})
