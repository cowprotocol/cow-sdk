import { ETH_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'
import { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

import { adaptToken, getTokenByAddressAndChainId } from './util'

import { WRAPPED_NATIVE_CURRENCIES } from './const'

describe('Near Intents Utils', () => {
  describe('adaptToken', () => {
    it('should adapt a token without contractAddress', () => {
      const tokenResponse: TokenResponse = {
        assetId: 'nep141:eth.omft.near',
        decimals: 18,
        blockchain: TokenResponse.blockchain.ETH,
        symbol: 'ETH',
        price: 4503.21,
        priceUpdatedAt: '2025-09-12T04:08:30.252Z',
      }

      expect(adaptToken(tokenResponse)).toStrictEqual({
        chainId: SupportedChainId.MAINNET,
        decimals: 18,
        address: WRAPPED_NATIVE_CURRENCIES['eth'],
        name: 'ETH',
        symbol: 'ETH',
      })
    })

    it('should adapt a token with contractAddress', () => {
      const tokenResponse: TokenResponse = {
        assetId: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
        decimals: 6,
        blockchain: TokenResponse.blockchain.ETH,
        symbol: 'USDC',
        price: 0.999788,
        priceUpdatedAt: '2025-09-12T04:08:30.252Z',
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      }

      expect(adaptToken(tokenResponse)).toStrictEqual({
        chainId: SupportedChainId.MAINNET,
        decimals: 6,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        name: 'USDC',
        symbol: 'USDC',
      })
    })

    it('should return null for a non supported chain', () => {
      const tokenResponse: TokenResponse = {
        assetId: 'nep141:sol.omft.near',
        decimals: 9,
        blockchain: TokenResponse.blockchain.SOL,
        symbol: 'SOL',
        price: 234.78,
        priceUpdatedAt: '2025-09-12T04:08:30.252Z',
      }

      expect(adaptToken(tokenResponse)).toStrictEqual(null)
    })
  })

  describe('getTokenByAddressAndChainId', () => {
    it('should get token by address and chain id using ETH_ADDRESS', () => {
      const token = {
        assetId: 'nep141:eth.omft.near',
        decimals: 18,
        blockchain: TokenResponse.blockchain.ETH,
        symbol: 'ETH',
        price: 4503.21,
        priceUpdatedAt: '2025-09-12T04:08:30.252Z',
      }
      const tokens: TokenResponse[] = [
        token,
        {
          assetId: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
          decimals: 6,
          blockchain: TokenResponse.blockchain.ETH,
          symbol: 'USDC',
          price: 0.999788,
          priceUpdatedAt: '2025-09-12T04:08:30.252Z',
          contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
      ]

      expect(getTokenByAddressAndChainId(tokens, ETH_ADDRESS, SupportedChainId.MAINNET)).toStrictEqual(token)
    })

    it('should get token by address and chain id using a contract address', () => {
      const token = {
        assetId: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
        decimals: 6,
        blockchain: TokenResponse.blockchain.ETH,
        symbol: 'USDC',
        price: 0.999788,
        priceUpdatedAt: '2025-09-12T04:08:30.252Z',
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      }
      const tokens: TokenResponse[] = [
        {
          assetId: 'nep141:eth.omft.near',
          decimals: 18,
          blockchain: TokenResponse.blockchain.ETH,
          symbol: 'ETH',
          price: 4503.21,
          priceUpdatedAt: '2025-09-12T04:08:30.252Z',
        },
        token,
      ]

      expect(
        getTokenByAddressAndChainId(tokens, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', SupportedChainId.MAINNET),
      ).toStrictEqual(token)
    })

    it('should return null if the token is not found', () => {
      const tokens: TokenResponse[] = [
        {
          assetId: 'nep141:eth.omft.near',
          decimals: 18,
          blockchain: TokenResponse.blockchain.ETH,
          symbol: 'ETH',
          price: 4503.21,
          priceUpdatedAt: '2025-09-12T04:08:30.252Z',
        },
        {
          assetId: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
          decimals: 6,
          blockchain: TokenResponse.blockchain.ETH,
          symbol: 'USDC',
          price: 0.999788,
          priceUpdatedAt: '2025-09-12T04:08:30.252Z',
          contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
      ]

      expect(
        getTokenByAddressAndChainId(
          tokens,
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          SupportedChainId.ARBITRUM_ONE,
        ),
      ).toStrictEqual(undefined)
    })
  })
})
