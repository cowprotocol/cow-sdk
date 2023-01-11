import { OrderKind } from '@cowprotocol/contracts'

export enum CliOperations {
  signOrder = 'Sign order',
  sendOrder = 'Send order',
  cancelOrder = 'Cancel order',
}

export type CliOperationsKeys = keyof typeof CliOperations

export interface CommonOperationParams {
  chainId: string
  privateKey: string
}

export interface SignOrderOperationParams extends CommonOperationParams {
  account: string
  expiresIn: string
  kind: OrderKind
  partiallyFillable: string
  sellToken: string
  buyToken: string
  feeAmount: string
  sellAmount: string
  buyAmount: string
  receiver?: string
}

export type CliOperation<T = undefined> = (isRunningWithArgv: boolean, params?: T) => Promise<void>
