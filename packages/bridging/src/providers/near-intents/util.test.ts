import {
  BTC_CURRENCY_ADDRESS,
  ETH_ADDRESS,
  EVM_NATIVE_CURRENCY_ADDRESS,
  NonEvmChains,
  SOL_NATIVE_CURRENCY_ADDRESS,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

import { adaptToken, getTokenByAddressAndChainId } from './util'

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
        address: EVM_NATIVE_CURRENCY_ADDRESS,
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

    it("should adapt a BTC native token whose contractAddress is the 'coin' placeholder", () => {
      const tokenResponse: TokenResponse = {
        assetId: '1cs_v1:btc:native:coin',
        decimals: 8,
        blockchain: TokenResponse.blockchain.BTC,
        symbol: 'BTC(OMNI)',
        price: 77297,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
        contractAddress: 'coin',
      }

      expect(adaptToken(tokenResponse)).toStrictEqual({
        chainId: NonEvmChains.BITCOIN,
        decimals: 8,
        address: BTC_CURRENCY_ADDRESS,
        name: 'BTC(OMNI)',
        symbol: 'BTC(OMNI)',
      })
    })

    it('should adapt a BTC native token without contractAddress', () => {
      const tokenResponse: TokenResponse = {
        assetId: 'nep141:btc.example.near',
        decimals: 8,
        blockchain: TokenResponse.blockchain.BTC,
        symbol: 'BTC',
        price: 77297,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
      }

      expect(adaptToken(tokenResponse)).toStrictEqual({
        chainId: NonEvmChains.BITCOIN,
        decimals: 8,
        address: BTC_CURRENCY_ADDRESS,
        name: 'BTC',
        symbol: 'BTC',
      })
    })

    it('should adapt a SOL native token without contractAddress', () => {
      const tokenResponse: TokenResponse = {
        assetId: 'nep141:sol.omft.near',
        decimals: 9,
        blockchain: TokenResponse.blockchain.SOL,
        symbol: 'SOL',
        price: 150,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
      }

      expect(adaptToken(tokenResponse)).toStrictEqual({
        chainId: NonEvmChains.SOLANA,
        decimals: 9,
        address: SOL_NATIVE_CURRENCY_ADDRESS,
        name: 'SOL',
        symbol: 'SOL',
      })
    })

    it('should adapt a SOL SPL token (with contractAddress) using its contractAddress', () => {
      const tokenResponse: TokenResponse = {
        assetId: 'nep141:sol-usdc.example.near',
        decimals: 6,
        blockchain: TokenResponse.blockchain.SOL,
        symbol: 'USDC',
        price: 1,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
        contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      }

      expect(adaptToken(tokenResponse)).toStrictEqual({
        chainId: NonEvmChains.SOLANA,
        decimals: 6,
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USDC',
        symbol: 'USDC',
      })
    })

    it('should adapt a BTC non-native token using its contractAddress', () => {
      const tokenResponse: TokenResponse = {
        assetId: 'nep141:btc-token.example.near',
        decimals: 8,
        blockchain: TokenResponse.blockchain.BTC,
        symbol: 'BRC',
        price: 1,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
        contractAddress: 'bc1qbrc20token',
      }

      expect(adaptToken(tokenResponse)).toStrictEqual({
        chainId: NonEvmChains.BITCOIN,
        decimals: 8,
        address: 'bc1qbrc20token',
        name: 'BRC',
        symbol: 'BRC',
      })
    })

    it('should return null for a non supported chain', () => {
      const tokenResponse: TokenResponse = {
        assetId: 'nep141:ton.omft.near',
        decimals: 9,
        blockchain: TokenResponse.blockchain.TON,
        symbol: 'TON',
        price: 5.0,
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

    it("should match BTC native token whose contractAddress is the 'coin' placeholder", () => {
      const btcToken: TokenResponse = {
        assetId: '1cs_v1:btc:native:coin',
        decimals: 8,
        blockchain: TokenResponse.blockchain.BTC,
        symbol: 'BTC(OMNI)',
        price: 77297,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
        contractAddress: 'coin',
      }

      expect(getTokenByAddressAndChainId([btcToken], BTC_CURRENCY_ADDRESS, NonEvmChains.BITCOIN)).toStrictEqual(
        btcToken,
      )
    })

    it('should match BTC native token without contractAddress', () => {
      const btcToken: TokenResponse = {
        assetId: 'nep141:btc.example.near',
        decimals: 8,
        blockchain: TokenResponse.blockchain.BTC,
        symbol: 'BTC',
        price: 77297,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
      }

      expect(getTokenByAddressAndChainId([btcToken], BTC_CURRENCY_ADDRESS, NonEvmChains.BITCOIN)).toStrictEqual(
        btcToken,
      )
    })

    it('should match SOL native token using SOL_NATIVE_CURRENCY_ADDRESS', () => {
      const solToken: TokenResponse = {
        assetId: 'nep141:sol.omft.near',
        decimals: 9,
        blockchain: TokenResponse.blockchain.SOL,
        symbol: 'SOL',
        price: 150,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
      }

      expect(
        getTokenByAddressAndChainId([solToken], SOL_NATIVE_CURRENCY_ADDRESS, NonEvmChains.SOLANA),
      ).toStrictEqual(solToken)
    })

    it('should match a SOL SPL token by contractAddress', () => {
      const solToken: TokenResponse = {
        assetId: 'nep141:sol-usdc.example.near',
        decimals: 6,
        blockchain: TokenResponse.blockchain.SOL,
        symbol: 'USDC',
        price: 1,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
        contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      }

      expect(
        getTokenByAddressAndChainId(
          [solToken],
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          NonEvmChains.SOLANA,
        ),
      ).toStrictEqual(solToken)
    })

    it('should not match a SOL SPL token when querying with SOL_NATIVE_CURRENCY_ADDRESS', () => {
      const solSplToken: TokenResponse = {
        assetId: 'nep141:sol-usdc.example.near',
        decimals: 6,
        blockchain: TokenResponse.blockchain.SOL,
        symbol: 'USDC',
        price: 1,
        priceUpdatedAt: '2026-05-18T13:29:00.433Z',
        contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      }

      expect(
        getTokenByAddressAndChainId([solSplToken], SOL_NATIVE_CURRENCY_ADDRESS, NonEvmChains.SOLANA),
      ).toStrictEqual(undefined)
    })

    it('should not return a non-native EVM token when querying with ETH_ADDRESS', () => {
      const usdc: TokenResponse = {
        assetId: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
        decimals: 6,
        blockchain: TokenResponse.blockchain.ETH,
        symbol: 'USDC',
        price: 0.999788,
        priceUpdatedAt: '2025-09-12T04:08:30.252Z',
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      }

      expect(getTokenByAddressAndChainId([usdc], ETH_ADDRESS, SupportedChainId.MAINNET)).toStrictEqual(undefined)
    })
  })
})
