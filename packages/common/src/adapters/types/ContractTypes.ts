/**
 * Generic contract interface that works across all adapters
 */
export interface GenericContract {
  address: string
  estimateGas: Record<string, (...args: any[]) => Promise<any>>
  interface: GenericContractInterface
  functions: Record<string, (...args: any[]) => any>
  [functionName: string]: any
}

/**
 * Generic contract interface for encoding/decoding
 */
export interface GenericContractInterface {
  encodeFunctionData(functionName: string, args: unknown[]): string
  decodeFunctionData(functionName: string, data: string): unknown[]
  decodeFunctionResult?(functionName: string, data: string): unknown[]
  fragments?: any[]
  getFunction?(functionName: string): any
}

/**
 * ETH Flow order data structure - Compatible with all adapters
 */
export interface EthFlowOrderData {
  buyToken: string
  receiver: string
  sellAmount: string | bigint
  buyAmount: string | bigint
  appData: string
  feeAmount: string | bigint
  validTo: string | number | bigint
  partiallyFillable: boolean
  quoteId: number | bigint
}

/**
 * Settlement contract methods interface
 */
export interface SettlementContract extends GenericContract {
  setPreSignature(orderUid: string, signed: boolean): Promise<any>
  invalidateOrder(orderUid: string): Promise<any>
  domainSeparator(): Promise<string>
}

/**
 * EthFlow contract methods interface
 */
export interface EthFlowContract extends GenericContract {
  createOrder(order: EthFlowOrderData, options?: { value: string | bigint }): Promise<any>
  invalidateOrder(order: EthFlowOrderData): Promise<any>
  orders(orderHash: string): Promise<{ owner: string; validTo: number }>
}
