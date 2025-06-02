export interface ICoWShedOptions {
  factoryAddress: string
  proxyCreationCode?: string
  implementationAddress: string
}

export interface ICoWShedCall {
  target: string
  value: bigint
  callData: string
  allowFailure: boolean
  isDelegateCall: boolean
}

export interface ICoWShedOptions {
  factoryAddress: string
  proxyCreationCode?: string
  implementationAddress: string
}
