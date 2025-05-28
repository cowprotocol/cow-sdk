import { createAdapters, createWallets, TEST_ADDRESS } from './setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { OrderSigningUtils } from '../src/orderSigningUtils'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { UnsignedOrder } from '../src/types'
import { OrderKind } from '@cowprotocol/sdk-order-book'

describe('OrderSigningUtils', () => {
  let adapters: ReturnType<typeof createAdapters>

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
      const wallets = createWallets()
      const signatures: Record<string, string> = {}

      for (const [adapterName, { adapter, wallet }] of Object.entries(wallets)) {
        setGlobalAdapter(adapter)
        const result = await OrderSigningUtils.signOrder(testOrder, SupportedChainId.SEPOLIA, wallet)
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
      const wallets = createWallets()
      const signatures: Record<string, string> = {}

      for (const [adapterName, { adapter, wallet }] of Object.entries(wallets)) {
        setGlobalAdapter(adapter)
        const result = await OrderSigningUtils.signOrderCancellation(orderId, SupportedChainId.SEPOLIA, wallet)
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
      const wallets = createWallets()
      const signatures: Record<string, string> = {}

      for (const [adapterName, { adapter, wallet }] of Object.entries(wallets)) {
        setGlobalAdapter(adapter)
        const result = await OrderSigningUtils.signOrderCancellations(ordersUids, SupportedChainId.SEPOLIA, wallet)
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
      const wallets = createWallets()
      const domains: Record<string, any> = {}

      for (const [adapterName, { adapter }] of Object.entries(wallets)) {
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
      const wallets = createWallets()
      const orderIds: Record<string, { orderId: string; orderDigest: string }> = {}

      for (const [adapterName, { adapter }] of Object.entries(wallets)) {
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
      expect(orderIdValues[0]!.orderId).toMatch(/^0x[a-fA-F0-9]+$/)
      expect(orderIdValues[0]!.orderDigest).toMatch(/^0x[a-fA-F0-9]+$/)
    })
  })

  describe('getDomainSeparator', () => {
    test('should return consistent domain separator across different adapters', async () => {
      const wallets = createWallets()
      const domainSeparators: Record<string, string> = {}

      for (const [adapterName, { adapter }] of Object.entries(wallets)) {
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

  describe('getEIP712Types', () => {
    test('should return correct EIP-712 types structure', () => {
      const types = OrderSigningUtils.getEIP712Types()

      expect(types).toEqual({
        Order: [
          { name: 'sellToken', type: 'address' },
          { name: 'buyToken', type: 'address' },
          { name: 'receiver', type: 'address' },
          { name: 'sellAmount', type: 'uint256' },
          { name: 'buyAmount', type: 'uint256' },
          { name: 'validTo', type: 'uint32' },
          { name: 'appData', type: 'bytes32' },
          { name: 'feeAmount', type: 'uint256' },
          { name: 'kind', type: 'string' },
          { name: 'partiallyFillable', type: 'bool' },
          { name: 'sellTokenBalance', type: 'string' },
          { name: 'buyTokenBalance', type: 'string' },
        ],
      })
    })
  })
})
