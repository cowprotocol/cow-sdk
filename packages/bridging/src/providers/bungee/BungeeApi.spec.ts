import { BungeeApi } from './BungeeApi'
import { SupportedEvmChainId, TargetEvmChainId } from '@cowprotocol/sdk-config'
import { createAdapters } from '../../../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import fetchMock from 'jest-fetch-mock'

// unmock cross-fetch to use the real API
fetchMock.disableMocks()

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  // TODO: these tests should be run locally and not by the CI.
  describe.skip(`BungeeApi: Shape of API response (with ${adapterName})`, () => {
    let api: BungeeApi

    beforeEach(() => {
      const adapter = adapters[adapterName]

      setGlobalAdapter(adapter)
      // Use the real API (not mocked)
      api = new BungeeApi()
    })

    describe('getBungeeQuote', () => {
      it('should return a quote from Arbitrum to Base', async () => {
        const result = await api.getBungeeQuote({
          userAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          originChainId: SupportedEvmChainId.ARBITRUM_ONE.toString(),
          destinationChainId: SupportedEvmChainId.BASE.toString(),
          inputToken: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // weth
          inputAmount: '3000000000000000', // 0.0003 eth
          receiverAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          outputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // weth
          enableManual: true,
          disableSwapping: true,
          disableAuto: true,
        })

        expect(result).toBeDefined()
        expect(result.originChainId).toBe(SupportedEvmChainId.ARBITRUM_ONE)
        expect(result.destinationChainId).toBe(SupportedEvmChainId.BASE)
        expect(result.route).toBeDefined()
        expect(result.routeBridge).toBeDefined()
      })

      it('should return a quote from Mainnet to Gnosis', async () => {
        const result = await api.getBungeeQuote({
          userAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          originChainId: SupportedEvmChainId.MAINNET.toString(),
          destinationChainId: SupportedEvmChainId.GNOSIS_CHAIN.toString(),
          inputToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // dai
          inputAmount: '10000000000000000000', // 10 dai
          receiverAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          outputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // xDAI
          enableManual: true,
          disableSwapping: true,
          disableAuto: true,
        })

        expect(result).toBeDefined()
        expect(result.originChainId).toBe(SupportedEvmChainId.MAINNET)
        expect(result.destinationChainId).toBe(SupportedEvmChainId.GNOSIS_CHAIN)
        expect(result.route).toBeDefined()
        expect(result.routeBridge).toBe('gnosis-native-bridge')
      })

      // TODO: the test is flacky
      it.skip('should return a quote from Mainnet to Polygon', async () => {
        const result = await api.getBungeeQuote({
          userAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          originChainId: SupportedEvmChainId.MAINNET.toString(),
          destinationChainId: SupportedEvmChainId.POLYGON.toString(),
          inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // weth
          inputAmount: '1000000000000000000',
          receiverAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          outputToken: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // weth
          enableManual: true,
          disableSwapping: true,
          disableAuto: true,
        })

        expect(result).toBeDefined()
        expect(result.originChainId).toBe(SupportedEvmChainId.MAINNET)
        expect(result.destinationChainId).toBe(SupportedEvmChainId.POLYGON)
        expect(result.route).toBeDefined()
        expect(result.routeBridge).toBeDefined()
      }, 10_000)
    })

    describe('getBungeeBuildTx', () => {
      it('should build the tx data for a given quote from Arbitrum to Base', async () => {
        // First get a quote
        const quote = await api.getBungeeQuote({
          userAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          originChainId: SupportedEvmChainId.ARBITRUM_ONE.toString(),
          destinationChainId: SupportedEvmChainId.BASE.toString(),
          inputToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth
          inputAmount: '2389939424141418',
          receiverAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          outputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // weth
          enableManual: true,
          disableSwapping: true,
          disableAuto: true,
        })

        // Then get the build tx
        const result = await api.getBungeeBuildTx(quote)

        expect(result).toBeDefined()
        expect(result.txData).toBeDefined()
        expect(result.txData.data).toBeDefined()
        expect(result.txData.to).toBeDefined()
        expect(result.txData.chainId).toBeDefined()
        expect(result.txData.value).toBeDefined()
        expect(result.approvalData).toBeDefined()
      })

      it('should build the tx data for a given quote from Mainnet to Gnosis', async () => {
        // First get a quote
        const quote = await api.getBungeeQuote({
          userAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          originChainId: SupportedEvmChainId.MAINNET.toString(),
          destinationChainId: SupportedEvmChainId.GNOSIS_CHAIN.toString(),
          inputToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // dai
          inputAmount: '10000000000000000000', // 10 dai
          receiverAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
          outputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // weth
          enableManual: true,
          disableSwapping: true,
          disableAuto: true,
        })

        // Then get the build tx
        const result = await api.getBungeeBuildTx(quote)

        expect(result).toBeDefined()
        expect(result.txData).toBeDefined()
        expect(result.txData.data).toBeDefined()
        expect(result.txData.to).toBeDefined()
        expect(result.txData.chainId).toBe(SupportedEvmChainId.MAINNET)
        expect(result.txData.value).toBeDefined()
        expect(result.approvalData).toBeDefined()
      })
    })

    describe('getEvents', () => {
      it('should return the events for a given orderId', async () => {
        // Note: This test requires a valid orderId from a previous transaction
        // Using a known orderId from a previous transaction
        const result = await api.getEvents({
          orderId:
            '0x0bfa5c44e95964a907d5f0d69ea65221e3a8fb1871e41aa3195e446c4ce855bbdaee4d2156de6fe6f7d50ca047136d758f96a6f067ee7474',
        })

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        if (result.length > 0) {
          const event = result[0]
          expect(event?.identifier).toBeDefined()
          expect(event?.srcTransactionHash).toBeDefined()
          expect(event?.bridgeName).toBeDefined()
          expect(event?.fromChainId).toBeDefined()
          expect(event?.isCowswapTrade).toBeDefined()
          expect(event?.orderId).toBeDefined()
          expect(event?.recipient).toBeDefined()
          expect(event?.sender).toBeDefined()
          expect(event?.destTransactionHash).toBeDefined()
          expect(event?.srcTxStatus).toBeDefined()
          expect(event?.destTxStatus).toBeDefined()
        }
      })

      it('should return the events for a given orderId (Mainnet USDC to Gnosis xDAI)', async () => {
        const result = await api.getEvents({
          orderId:
            '0x0dc2da6dfaf0d82435d7afa1cab8cfe628c75a03e3981978c762d51bc7eef19d279a80cb2b913ade60b1c5d4333966f45c3dd8b168a6ef92',
        })

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        if (result.length > 0) {
          const event = result[0]
          expect(event?.identifier).toBe(
            '0x000000000000000000000000000000000000000000000000000000000000071b-gnosis-native-bridge',
          )
          expect(event?.srcTransactionHash).toBe('0x120040a5440d8a07dc06de21322899f1a8c1611adbb3e7ee024622de9f9f6bca')
          expect(event?.bridgeName).toBe('gnosis-native-bridge')
          expect(event?.fromChainId).toBe(SupportedEvmChainId.MAINNET)
          expect(event?.isCowswapTrade).toBe(true)
          expect(event?.orderId).toBe(
            '0x0dc2da6dfaf0d82435d7afa1cab8cfe628c75a03e3981978c762d51bc7eef19d279a80cb2b913ade60b1c5d4333966f45c3dd8b168a6ef92',
          )
          expect(event?.recipient).toBe('0x279a80cB2B913Ade60b1C5d4333966f45c3dd8B1')
          expect(event?.sender).toBe('0xc8dD9d8684a2457d4d61e4A65146190798513042')
          expect(event?.destTransactionHash).toBeDefined()
          expect(event?.srcTxStatus).toBe('COMPLETED')
          expect(event?.destTxStatus).toBe('COMPLETED')
          expect(event?.bridgeName).toBe('gnosis-native-bridge')
        }
      })
    })

    describe('getAcrossStatus', () => {
      it('should return the status of the deposit transaction', async () => {
        // Note: This test requires a valid depositTxHash from a previous transaction
        // Using a known depositTxHash from a previous transaction
        const result = await api.getAcrossStatus('0x2bb3be895fd9be20522562cd62b52ae8d58eb00b31548c2caa7fcb557708f4cf')

        expect(result).toBeDefined()
        expect(['filled', 'pending', 'expired', 'refunded', 'slowFillRequested']).toContain(result)
      })
    })

    describe('getBuyTokens', () => {
      it('should return tokens for supported chain', async () => {
        const result = await api.getBuyTokens({ buyChainId: SupportedEvmChainId.ARBITRUM_ONE })

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        if (result.length > 0) {
          const token = result[0]
          expect(token?.address).toBeDefined()
          expect(token?.chainId).toBeDefined()
          expect(token?.decimals).toBeDefined()
          expect(token?.logoUrl).toBeDefined()

          // should include USDC 0xaf88d065e77c8cc2239327c5edb3a432268e5831
          const usdc = result.find((token) => token.address === '0xaf88d065e77c8cc2239327c5edb3a432268e5831')
          expect(usdc).toBeDefined()
          expect(usdc?.address.toLowerCase()).toBe('0xaf88d065e77c8cc2239327c5edb3a432268e5831'.toLowerCase())
          expect(usdc?.name).toBe('USDC')
          expect(usdc?.symbol).toBe('USDC')
          expect(usdc?.logoUrl).toBeDefined()
          expect(usdc?.decimals).toBe(6)
          expect(usdc?.chainId).toBe(SupportedEvmChainId.ARBITRUM_ONE)
        }
      })

      it('should return empty array for unsupported chain', async () => {
        const result = await api.getBuyTokens({ buyChainId: 12345 as TargetEvmChainId })
        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(0)
      })
    })

    describe('getIntermediateTokens', () => {
      // TODO: flacky test
      it.skip('should return the intermediate tokens from Arbitrum to Base', async () => {
        const result = await api.getIntermediateTokens({
          fromChainId: SupportedEvmChainId.ARBITRUM_ONE,
          toChainId: SupportedEvmChainId.BASE,
          toTokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
        })

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        if (result.length > 0) {
          const token = result[0]
          expect(token?.address).toBeDefined()
          expect(token?.chainId).toBeDefined()
          expect(token?.decimals).toBeDefined()
          expect(token?.logoUrl).toBeDefined()
          expect(token?.name).toBeDefined()
          expect(token?.symbol).toBeDefined()

          // should include USDC 0xaf88d065e77c8cc2239327c5edb3a432268e5831
          const usdc = result.find((token) => token.address === '0xaf88d065e77c8cc2239327c5edb3a432268e5831')
          expect(usdc).toBeDefined()
          expect(usdc?.address.toLowerCase()).toBe('0xaf88d065e77c8cc2239327c5edb3a432268e5831'.toLowerCase())
          expect(usdc?.name).toBe('USDC')
          expect(usdc?.symbol).toBe('USDC')
          expect(usdc?.logoUrl).toBeDefined()
          expect(usdc?.decimals).toBe(6)
          expect(usdc?.chainId).toBe(SupportedEvmChainId.ARBITRUM_ONE)
        }
      })

      // TODO: flacky test
      it.skip('should return the intermediate tokens from Mainnet to Gnosis', async () => {
        const result = await api.getIntermediateTokens({
          fromChainId: SupportedEvmChainId.MAINNET,
          toChainId: SupportedEvmChainId.GNOSIS_CHAIN,
          toTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', // USDC
        })

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        if (result.length > 0) {
          const token = result[0]
          expect(token?.address).toBeDefined()
          expect(token?.chainId).toBeDefined()
          expect(token?.decimals).toBeDefined()
          expect(token?.logoUrl).toBeDefined()
          expect(token?.name).toBeDefined()
          expect(token?.symbol).toBeDefined()

          // // should include USDC 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
          const usdc = result.find((token) => token.address === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
          expect(usdc).toBeDefined()
          expect(usdc?.address.toLowerCase()).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'.toLowerCase())
          expect(usdc?.name).toBe('USDC')
          expect(usdc?.symbol).toBe('USDC')
          expect(usdc?.logoUrl).toBeDefined()
          expect(usdc?.decimals).toBe(6)
          expect(usdc?.chainId).toBe(SupportedEvmChainId.MAINNET)
        }
      })
    })
  })
})
