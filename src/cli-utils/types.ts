import { OrderKind } from '@cowprotocol/contracts'

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
