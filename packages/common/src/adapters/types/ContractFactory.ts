import { EthFlowContract, SettlementContract, EthFlowOrderData } from './ContractTypes'
import { EthFlowAbi, GPV2SettlementAbi } from '../../abi/index'
import { getGlobalAdapter } from '../context'

/**
 * Generic contract factory that works with all adapters
 */
export class ContractFactory {
  static createEthFlowContract(address: string, signer: any): EthFlowContract {
    const adapter = getGlobalAdapter()

    return {
      address,
      estimateGas: {
        createOrder: async (order: EthFlowOrderData, options?: { value: string | bigint }) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(EthFlowAbi, 'createOrder', [order]),
            value: options?.value || '0',
          }
          return await signer.estimateGas(txParams)
        },
        invalidateOrder: async (order: EthFlowOrderData) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(EthFlowAbi, 'invalidateOrder', [order]),
          }
          return await signer.estimateGas(txParams)
        },
        orders: async (orderHash: string) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(EthFlowAbi, 'orders', [orderHash]),
          }
          return await signer.estimateGas(txParams)
        },
      },
      interface: {
        encodeFunctionData: (functionName: string, args: unknown[]) => {
          if (functionName === 'createOrder' || functionName === 'invalidateOrder') {
            return adapter.utils.encodeFunction(EthFlowAbi, functionName, args)
          }
          return adapter.utils.encodeFunction(EthFlowAbi, functionName, args)
        },
        decodeFunctionData: (functionName: string, data: string) => {
          return adapter.utils.decodeFunctionData(EthFlowAbi, functionName, data)
        },
      },
      functions: {
        createOrder: async (order: EthFlowOrderData, options?: { value: string | bigint }) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(EthFlowAbi, 'createOrder', [order]),
            value: options?.value || '0',
          }
          return await signer.sendTransaction(txParams)
        },
        invalidateOrder: async (order: EthFlowOrderData) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(EthFlowAbi, 'invalidateOrder', [order]),
          }
          return await signer.sendTransaction(txParams)
        },
        orders: async (orderHash: string) => {
          return (await adapter.readContract({
            address,
            abi: EthFlowAbi,
            functionName: 'orders',
            args: [orderHash],
          })) as { owner: string; validTo: number }
        },
      },
      createOrder: async (order: EthFlowOrderData, options?: { value: string | bigint }) => {
        const txParams = {
          to: address,
          data: adapter.utils.encodeFunction(EthFlowAbi, 'createOrder', [order]),
          value: options?.value || '0',
        }
        return await signer.sendTransaction(txParams)
      },
      invalidateOrder: async (order: EthFlowOrderData) => {
        const txParams = {
          to: address,
          data: adapter.utils.encodeFunction(EthFlowAbi, 'invalidateOrder', [order]),
        }
        return await signer.sendTransaction(txParams)
      },
      orders: async (orderHash: string) => {
        return (await adapter.readContract({
          address,
          abi: EthFlowAbi,
          functionName: 'orders',
          args: [orderHash],
        })) as { owner: string; validTo: number }
      },
    }
  }

  static createSettlementContract(address: string, signer: any): SettlementContract {
    const adapter = getGlobalAdapter()

    return {
      address,
      estimateGas: {
        setPreSignature: async (orderUid: string, signed: boolean) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(GPV2SettlementAbi, 'setPreSignature', [orderUid, signed]),
          }
          return await signer.estimateGas(txParams)
        },
        invalidateOrder: async (orderUid: string) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(GPV2SettlementAbi, 'invalidateOrder', [orderUid]),
          }
          return await signer.estimateGas(txParams)
        },
        domainSeparator: async () => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(GPV2SettlementAbi, 'domainSeparator', []),
          }
          return await signer.estimateGas(txParams)
        },
      },
      interface: {
        encodeFunctionData: (functionName: string, args: unknown[]) => {
          return adapter.utils.encodeFunction(GPV2SettlementAbi, functionName, args)
        },
        decodeFunctionData: (functionName: string, data: string) => {
          return adapter.utils.decodeFunctionData(GPV2SettlementAbi, functionName, data)
        },
      },
      functions: {
        setPreSignature: async (orderUid: string, signed: boolean) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(GPV2SettlementAbi, 'setPreSignature', [orderUid, signed]),
          }
          return await signer.sendTransaction(txParams)
        },
        invalidateOrder: async (orderUid: string) => {
          const txParams = {
            to: address,
            data: adapter.utils.encodeFunction(GPV2SettlementAbi, 'invalidateOrder', [orderUid]),
          }
          return await signer.sendTransaction(txParams)
        },
        domainSeparator: async () => {
          return (await adapter.readContract({
            address,
            abi: GPV2SettlementAbi,
            functionName: 'domainSeparator',
            args: [],
          })) as string
        },
      },
      setPreSignature: async (orderUid: string, signed: boolean) => {
        const txParams = {
          to: address,
          data: adapter.utils.encodeFunction(GPV2SettlementAbi, 'setPreSignature', [orderUid, signed]),
        }
        return await signer.sendTransaction(txParams)
      },
      invalidateOrder: async (orderUid: string) => {
        const txParams = {
          to: address,
          data: adapter.utils.encodeFunction(GPV2SettlementAbi, 'invalidateOrder', [orderUid]),
        }
        return await signer.sendTransaction(txParams)
      },
      domainSeparator: async () => {
        return (await adapter.readContract({
          address,
          abi: GPV2SettlementAbi,
          functionName: 'domainSeparator',
          args: [],
        })) as string
      },
    }
  }
}
