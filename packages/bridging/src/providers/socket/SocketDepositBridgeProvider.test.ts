import { OrderKind } from '@cowprotocol/sdk-order-book'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { BridgeStatus, QuoteBridgeRequest } from '../../types'
import { SocketApi } from './SocketApi'
import { SOCKET_HOOK_DAPP_ID } from './const'
import { SocketDepositBridgeProvider } from './SocketDepositBridgeProvider'
import { SocketQuoteResponse, SocketStatusResponse } from './types'

class SocketDepositBridgeProviderTest extends SocketDepositBridgeProvider {
  public setApi(api: SocketApi) {
    this.api = api
  }
}

const sourceToken = {
  chainId: SupportedChainId.BASE,
  address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  name: 'USDC',
  symbol: 'USDC',
  decimals: 6,
  logoURI: 'https://example.com/usdc.png',
}

const targetToken = {
  chainId: SupportedChainId.ARBITRUM_ONE,
  address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  name: 'USDC',
  symbol: 'USDC',
  decimals: 6,
  logoURI: 'https://example.com/usdc.png',
}

const quoteRequest: QuoteBridgeRequest = {
  kind: OrderKind.SELL,
  sellTokenChainId: SupportedChainId.BASE,
  sellTokenAddress: sourceToken.address,
  sellTokenDecimals: 6,
  buyTokenChainId: SupportedChainId.ARBITRUM_ONE,
  buyTokenAddress: targetToken.address,
  buyTokenDecimals: 6,
  amount: 2_000_000n,
  account: '0x1111111111111111111111111111111111111111',
  signer: '0x1111111111111111111111111111111111111111111111111111111111111111',
  receiver: '0x2222222222222222222222222222222222222222',
  appCode: 'test',
}

const quoteResponse: SocketQuoteResponse = {
  success: true,
  statusCode: 200,
  result: {
    originChainId: SupportedChainId.BASE,
    destinationChainId: SupportedChainId.ARBITRUM_ONE,
    userAddress: quoteRequest.account,
    receiverAddress: '0x2222222222222222222222222222222222222222',
    input: {
      token: sourceToken,
      amount: '2000000',
    },
    routes: [
      {
        userOp: 'deposit',
        quoteId: '0xquote',
        expiresAt: 1784373937,
        output: {
          token: targetToken,
          amount: '1983298',
          minAmountOut: '1973381',
        },
        estimatedTime: 2,
        slippage: 0.5,
        routeTags: ['SUGGESTED'],
        deposit: {
          chainId: SupportedChainId.BASE,
          token: sourceToken,
          amount: '2000000',
          transferType: 'erc20_transfer',
          depositAddress: '0x7621C31B966F9b72aD34151f6FbF4aAc2a75Bc04',
          memo: null,
        },
      },
    ],
  },
}

const statusResponse: SocketStatusResponse = {
  success: true,
  statusCode: 200,
  result: {
    quoteId: '0xquote',
    userOp: 'deposit',
    status: 'COMPLETED',
    statusCode: 'COMPLETED',
    origin: {
      chainId: SupportedChainId.BASE,
      status: 'COMPLETED',
      txHash: '0xorigin',
      input: [{ token: sourceToken, amount: '2000000' }],
    },
    destination: {
      chainId: SupportedChainId.ARBITRUM_ONE,
      status: 'COMPLETED',
      txHash: '0xdestination',
      receiverAddress: '0x2222222222222222222222222222222222222222',
      output: [{ token: targetToken, amount: '1983298', minAmountOut: '1973381' }],
    },
  },
}

describe('SocketDepositBridgeProvider', () => {
  let provider: SocketDepositBridgeProviderTest
  let api: jest.Mocked<Pick<SocketApi, 'getTokens' | 'getQuote' | 'getStatus'>>

  beforeEach(() => {
    provider = new SocketDepositBridgeProviderTest()
    api = {
      getTokens: jest.fn(),
      getQuote: jest.fn(),
      getStatus: jest.fn(),
    }
    provider.setApi(api as unknown as SocketApi)
  })

  it('returns provider info', () => {
    expect(provider.info).toEqual({
      dappId: SOCKET_HOOK_DAPP_ID,
      name: 'Socket',
      type: 'ReceiverAccountBridgeProvider',
      logoUrl: expect.stringContaining('bungee-logo.png'),
      website: 'https://socket.tech',
    })
  })

  it('gets buy tokens from Socket token list', async () => {
    api.getTokens.mockResolvedValue([targetToken])

    const result = await provider.getBuyTokens({ buyChainId: SupportedChainId.ARBITRUM_ONE })

    expect(api.getTokens).toHaveBeenCalledWith([SupportedChainId.ARBITRUM_ONE])
    expect(result.isRouteAvailable).toBe(true)
    expect(result.tokens).toEqual([
      {
        chainId: SupportedChainId.ARBITRUM_ONE,
        address: targetToken.address,
        decimals: 6,
        name: 'USDC',
        symbol: 'USDC',
        logoUrl: targetToken.logoURI,
      },
    ])
  })

  it('returns source-chain intermediate tokens when target token is supported', async () => {
    api.getTokens.mockResolvedValueOnce([sourceToken]).mockResolvedValueOnce([targetToken])

    const result = await provider.getIntermediateTokens(quoteRequest)

    expect(result).toEqual([
      expect.objectContaining({
        chainId: SupportedChainId.BASE,
        address: sourceToken.address,
      }),
    ])
  })

  it('quotes a deposit route and returns the deposit address as receiver override', async () => {
    api.getQuote.mockResolvedValue(quoteResponse)

    const quote = await provider.getQuote(quoteRequest)

    expect(api.getQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        userOps: 'deposit',
        originChainId: SupportedChainId.BASE.toString(),
        destinationChainId: SupportedChainId.ARBITRUM_ONE.toString(),
        inputToken: sourceToken.address,
        outputToken: targetToken.address,
        receiverAddress: quoteRequest.receiver,
        refundAddress: quoteRequest.account,
      }),
    )
    expect(quote.id).toBe('0xquote')
    expect(quote.depositAddress).toBe('0x7621C31B966F9b72aD34151f6FbF4aAc2a75Bc04')
    expect(quote.amountsAndCosts.afterSlippage.buyAmount).toBe(1_973_381n)
    await expect(provider.getBridgeReceiverOverride(quoteRequest, quote)).resolves.toBe(quote.depositAddress)
  })

  it('maps Socket status to bridge status', async () => {
    api.getStatus.mockResolvedValue(statusResponse)

    const result = await provider.getStatus('0xquote', SupportedChainId.BASE)

    expect(result).toEqual({
      status: BridgeStatus.EXECUTED,
      depositTxHash: '0xorigin',
      fillTxHash: '0xdestination',
    })
  })
})
