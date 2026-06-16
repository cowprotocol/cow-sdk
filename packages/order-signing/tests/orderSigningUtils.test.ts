import { AdaptersTestSetup, createAdapters, TEST_ADDRESS } from './setup'
import { AbstractSigner, setGlobalAdapter } from '@cowprotocol/sdk-common'
import { OrderSigningUtils } from '../src/orderSigningUtils'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { ORDER_TYPE_FIELDS } from '@cowprotocol/sdk-contracts-ts'
import { UnsignedOrder } from '../src/types'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'

describe('OrderSigningUtils', () => {
  let adapters: AdaptersTestSetup

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('signOrder', () => {
    const testOrder: UnsignedOrder = {
      sellToken: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
      buyToken: '0x7B878668Cd1a3adF89764D3a331E0A7BB832192D',
      receiver: '0xa6ddbd0de6b310819b49f680f65871bee85f517e',
      sellAmount: '500000000000000',
      buyAmount: '23000020000',
      validTo: 5000222,
      appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
      feeAmount: '2300000',
      kind: OrderKind.SELL,
      partiallyFillable: true,
    }

    test('should consistently sign orders across different adapters', async () => {
      const signatures: Record<string, string> = {}

      for (const [adapterName, adapter] of Object.entries(adapters)) {
        setGlobalAdapter(adapter)
        const result = await OrderSigningUtils.signOrder(testOrder, SupportedChainId.SEPOLIA, adapter.signer)
        signatures[adapterName] = result.signature
      }

      // Expect the signatures to be consistent across adapters
      const signatureValues = Object.values(signatures)
      expect(signatureValues[0]).toBeDefined()
      expect(signatureValues[0]).toMatch(/^0x[a-fA-F0-9]+$/)

      for (let i = 1; i < signatureValues.length; i++) {
        expect(signatureValues[0]).toEqual(signatureValues[i])
      }
    })
  })

  describe('signOrderCancellation', () => {
    const orderId =
      '0xdaaa7dddec9ad04cc101a121e3eed017eab4d3927c045d407d5ad6700eea2bf7fb3c7eb936caa12b5a884d612393969a557d430764060343'

    test('should consistently sign order cancellations across different adapters', async () => {
      const signatures: Record<string, string> = {}

      for (const [adapterName, adapter] of Object.entries(adapters)) {
        setGlobalAdapter(adapter)
        const result = await OrderSigningUtils.signOrderCancellation(orderId, SupportedChainId.SEPOLIA, adapter.signer)
        signatures[adapterName] = result.signature
      }

      // Expect the signatures to be consistent across adapters
      const signatureValues = Object.values(signatures)
      expect(signatureValues[0]).toBeDefined()
      expect(signatureValues[0]).toMatch(/^0x[a-fA-F0-9]+$/)

      for (let i = 1; i < signatureValues.length; i++) {
        expect(signatureValues[0]).toEqual(signatureValues[i])
      }
    })
  })

  describe('signOrderCancellations', () => {
    const orderId1 =
      '0x1aaa7dddecccc04cc101a121e3eed017eab4d3927c045d407d5ad6700eea2bf7fb3c7eb936caa12b5a884d612393969a557d430764060343'
    const orderId2 =
      '0x2aaa7dddec22204cc101a121e3eed017eab4d3927c045d407d5ad6700eea2bf7fb3c7eb936caa12b5a884d612393969a557d430764060343'
    const orderId3 =
      '0x3aaa7dddec33304cc101a121e3eed017eab4d3927c045d407d5ad6700eea2bf7fb3c7eb936caa12b5a884d612393969a557d430764060343'

    const ordersUids = [orderId1, orderId2, orderId3]

    test('should consistently sign multiple order cancellations across different adapters', async () => {
      const signatures: Record<string, string> = {}

      for (const [adapterName, adapter] of Object.entries(adapters)) {
        setGlobalAdapter(adapter)
        const result = await OrderSigningUtils.signOrderCancellations(
          ordersUids,
          SupportedChainId.SEPOLIA,
          adapter.signer,
        )
        signatures[adapterName] = result.signature
      }

      // Expect the signatures to be consistent across adapters
      const signatureValues = Object.values(signatures)
      expect(signatureValues[0]).toBeDefined()
      expect(signatureValues[0]).toMatch(/^0x[a-fA-F0-9]+$/)

      for (let i = 1; i < signatureValues.length; i++) {
        expect(signatureValues[0]).toEqual(signatureValues[i])
      }
    })
  })

  describe('getDomain', () => {
    test('should return consistent domain info across different adapters', async () => {
      const domains: Record<string, any> = {}

      for (const [adapterName, adapter] of Object.entries(adapters)) {
        setGlobalAdapter(adapter)
        domains[adapterName] = await OrderSigningUtils.getDomain(SupportedChainId.SEPOLIA)
      }

      // All domains should be identical
      const domainValues = Object.values(domains)
      expect(domainValues[0]).toBeDefined()

      for (let i = 1; i < domainValues.length; i++) {
        expect(JSON.stringify(domainValues[0])).toEqual(JSON.stringify(domainValues[i]))
      }

      // Verify domain structure
      expect(domainValues[0]).toHaveProperty('chainId')
      expect(domainValues[0]).toHaveProperty('name')
      expect(domainValues[0]).toHaveProperty('verifyingContract')
      expect(domainValues[0]).toHaveProperty('version')
    })

    test('should use default settlement contract address when no options provided', async () => {
      setGlobalAdapter(adapters.viemAdapter)
      const domain = await OrderSigningUtils.getDomain(SupportedChainId.MAINNET)

      expect(domain.verifyingContract).toBe(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET])
    })

    test('should use staging settlement contract address when env is "staging"', async () => {
      setGlobalAdapter(adapters.viemAdapter)
      const domain = await OrderSigningUtils.getDomain(SupportedChainId.MAINNET, { env: 'staging' })

      expect(domain.verifyingContract).toBe(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[SupportedChainId.MAINNET])
    })

    test('should use custom settlement contract address when settlementContractOverride is provided', async () => {
      const customAddress = '0x1111111111111111111111111111111111111111'
      setGlobalAdapter(adapters.viemAdapter)

      const domain = await OrderSigningUtils.getDomain(SupportedChainId.MAINNET, {
        settlementContractOverride: { [SupportedChainId.MAINNET]: customAddress },
      })

      expect(domain.verifyingContract).toBe(customAddress)
    })

    test('should prioritize settlementContractOverride over staging env', async () => {
      const customAddress = '0x1111111111111111111111111111111111111111'
      setGlobalAdapter(adapters.viemAdapter)

      const domain = await OrderSigningUtils.getDomain(SupportedChainId.MAINNET, {
        env: 'staging',
        settlementContractOverride: { [SupportedChainId.MAINNET]: customAddress },
      })

      expect(domain.verifyingContract).toBe(customAddress)
    })
  })

  describe('generateOrderId', () => {
    const testOrder = {
      sellToken: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
      buyToken: '0x7B878668Cd1a3adF89764D3a331E0A7BB832192D',
      receiver: '0xa6ddbd0de6b310819b49f680f65871bee85f517e',
      sellAmount: '500000000000000',
      buyAmount: '23000020000',
      validTo: 5000222,
      appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
      feeAmount: '2300000',
      kind: OrderKind.SELL,
      partiallyFillable: true,
    }
    const params = { owner: TEST_ADDRESS }

    test('should generate consistent order IDs across different adapters', async () => {
      const orderIds: Record<string, { orderId: string; orderDigest: string }> = {}

      for (const [adapterName, adapter] of Object.entries(adapters)) {
        setGlobalAdapter(adapter)
        orderIds[adapterName] = await OrderSigningUtils.generateOrderId(SupportedChainId.SEPOLIA, testOrder, params)
      }

      // All order IDs should be identical
      const orderIdValues = Object.values(orderIds)
      expect(orderIdValues[0]).toBeDefined()

      for (let i = 1; i < orderIdValues.length; i++) {
        expect(JSON.stringify(orderIdValues[0])).toEqual(JSON.stringify(orderIdValues[i]))
      }

      // Verify structure
      expect(orderIdValues[0]?.orderId).toMatch(/^0x[a-fA-F0-9]+$/)
      expect(orderIdValues[0]?.orderDigest).toMatch(/^0x[a-fA-F0-9]+$/)
    })
  })

  describe('getDomainSeparator', () => {
    test('should return consistent domain separator across different adapters', async () => {
      const domainSeparators: Record<string, string> = {}

      for (const [adapterName, adapter] of Object.entries(adapters)) {
        setGlobalAdapter(adapter)
        domainSeparators[adapterName] = await OrderSigningUtils.getDomainSeparator(SupportedChainId.SEPOLIA)
      }

      // All domain separators should be identical
      const separatorValues = Object.values(domainSeparators)
      expect(separatorValues[0]).toBeDefined()
      expect(separatorValues[0]).toMatch(/^0x[a-fA-F0-9]{64}$/)

      for (let i = 1; i < separatorValues.length; i++) {
        expect(separatorValues[0]).toEqual(separatorValues[i])
      }
    })
  })

  describe('getEip1271Signature', () => {
    const testOrder: UnsignedOrder = {
      sellToken: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
      buyToken: '0x7B878668Cd1a3adF89764D3a331E0A7BB832192D',
      receiver: '0xa6ddbd0de6b310819b49f680f65871bee85f517e',
      sellAmount: '500000000000000',
      buyAmount: '23000020000',
      validTo: 5000222,
      appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
      feeAmount: '2300000',
      kind: OrderKind.SELL,
      partiallyFillable: true,
    }

    const mockEcdsaSignature =
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12'

    test('should produce consistent output across different adapters', () => {
      const results: Record<string, string> = {}

      for (const [adapterName, adapter] of Object.entries(adapters)) {
        setGlobalAdapter(adapter)
        results[adapterName] = OrderSigningUtils.getEip1271Signature(testOrder, mockEcdsaSignature)
      }

      const resultValues = Object.values(results)
      expect(resultValues[0]).toBeDefined()

      for (let i = 1; i < resultValues.length; i++) {
        expect(resultValues[0]).toEqual(resultValues[i])
      }
    })

    test('should encode order fields correctly', () => {
      setGlobalAdapter(adapters.viemAdapter)
      const result = OrderSigningUtils.getEip1271Signature(testOrder, mockEcdsaSignature)

      expect(result).toMatch(/^0x[a-fA-F0-9]+$/)
      expect(result.toLowerCase()).toContain(mockEcdsaSignature.slice(2).toLowerCase())
    })

    test('should handle different order kinds', () => {
      setGlobalAdapter(adapters.viemAdapter)

      const buyOrder: UnsignedOrder = { ...testOrder, kind: OrderKind.BUY }
      const sellOrder: UnsignedOrder = { ...testOrder, kind: OrderKind.SELL }

      const buyResult = OrderSigningUtils.getEip1271Signature(buyOrder, mockEcdsaSignature)
      const sellResult = OrderSigningUtils.getEip1271Signature(sellOrder, mockEcdsaSignature)

      expect(buyResult).not.toEqual(sellResult)
      expect(buyResult).toMatch(/^0x[a-fA-F0-9]+$/)
      expect(sellResult).toMatch(/^0x[a-fA-F0-9]+$/)
    })
  })

  describe('getEip7702Signature', () => {
    const testOrder: UnsignedOrder = {
      sellToken: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
      buyToken: '0x7B878668Cd1a3adF89764D3a331E0A7BB832192D',
      receiver: '0xa6ddbd0de6b310819b49f680f65871bee85f517e',
      sellAmount: '500000000000000',
      buyAmount: '23000020000',
      validTo: 5000222,
      appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
      feeAmount: '2300000',
      kind: OrderKind.SELL,
      partiallyFillable: true,
    }

    // 65-byte (130 hex chars) ECDSA signature, as produced by a plain EOA / 7702 delegate.
    const ecdsaSignature = `0x${'ab'.repeat(65)}`
    // A "wrapped" signature whose length differs from a plain ECDSA signature
    // (ERC-7739 / ERC-7579 modular account output).
    const wrappedSignature = `0x${'cd'.repeat(200)}`

    function createMockSigner(signature: string | null | undefined): {
      signer: AbstractSigner<unknown>
      signTypedData: jest.Mock
    } {
      const signTypedData = jest.fn().mockResolvedValue(signature)
      return { signer: { signTypedData } as unknown as AbstractSigner<unknown>, signTypedData }
    }

    beforeEach(() => {
      setGlobalAdapter(adapters.viemAdapter)
    })

    test('should wrap a plain ECDSA signature via EIP-1271 ABI tuple when scheme is EIP1271', async () => {
      const { signer } = createMockSigner(ecdsaSignature)

      const result = await OrderSigningUtils.getEip7702Signature(
        SupportedChainId.SEPOLIA,
        'prod',
        testOrder,
        SigningScheme.EIP1271,
        signer,
      )

      const expected = OrderSigningUtils.getEip1271Signature(testOrder, ecdsaSignature)
      expect(result).toEqual({ signature: expected, signingScheme: SigningScheme.EIP1271 })
    })

    test('should return raw ECDSA signature as EIP712 when scheme is not EIP1271', async () => {
      const { signer } = createMockSigner(ecdsaSignature)

      const result = await OrderSigningUtils.getEip7702Signature(
        SupportedChainId.SEPOLIA,
        'prod',
        testOrder,
        SigningScheme.EIP712,
        signer,
      )

      expect(result).toEqual({ signature: ecdsaSignature, signingScheme: SigningScheme.EIP712 })
    })

    test('should treat a 0x-prefixed and non-prefixed ECDSA signature identically', async () => {
      const { signer } = createMockSigner('ab'.repeat(65))

      const result = await OrderSigningUtils.getEip7702Signature(
        SupportedChainId.SEPOLIA,
        'prod',
        testOrder,
        SigningScheme.EIP712,
        signer,
      )

      expect(result).toEqual({ signature: 'ab'.repeat(65), signingScheme: SigningScheme.EIP712 })
    })

    test('should forward a wrapped signature as EIP1271 without ABI-tuple wrapping', async () => {
      const { signer } = createMockSigner(wrappedSignature)

      const result = await OrderSigningUtils.getEip7702Signature(
        SupportedChainId.SEPOLIA,
        'prod',
        testOrder,
        SigningScheme.EIP712,
        signer,
      )

      expect(result).toEqual({ signature: wrappedSignature, signingScheme: SigningScheme.EIP1271 })
    })

    test('should forward a wrapped signature as EIP1271 even when caller asks for EIP1271', async () => {
      const { signer } = createMockSigner(wrappedSignature)

      const result = await OrderSigningUtils.getEip7702Signature(
        SupportedChainId.SEPOLIA,
        'prod',
        testOrder,
        SigningScheme.EIP1271,
        signer,
      )

      // Wrapped bytes are forwarded verbatim, not run through getEip1271Signature.
      expect(result).toEqual({ signature: wrappedSignature, signingScheme: SigningScheme.EIP1271 })
    })

    test('should sign typed data using the resolved domain and Order type fields', async () => {
      const { signer, signTypedData } = createMockSigner(ecdsaSignature)

      await OrderSigningUtils.getEip7702Signature(
        SupportedChainId.SEPOLIA,
        'prod',
        testOrder,
        SigningScheme.EIP712,
        signer,
      )

      const expectedDomain = await OrderSigningUtils.getDomain(SupportedChainId.SEPOLIA, { env: 'prod' })
      expect(signTypedData).toHaveBeenCalledTimes(1)
      expect(signTypedData).toHaveBeenCalledWith(expectedDomain, { Order: ORDER_TYPE_FIELDS }, testOrder)
    })

    test('should forward env and settlementContractOverride to the signing domain', async () => {
      const customAddress = '0x1111111111111111111111111111111111111111'
      const { signer, signTypedData } = createMockSigner(ecdsaSignature)

      await OrderSigningUtils.getEip7702Signature(
        SupportedChainId.MAINNET,
        'staging',
        testOrder,
        SigningScheme.EIP712,
        signer,
        { [SupportedChainId.MAINNET]: customAddress },
      )

      const signedDomain = signTypedData.mock.calls[0][0]
      expect(signedDomain.verifyingContract).toBe(customAddress)
    })
  })
})
