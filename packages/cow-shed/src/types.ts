export interface ICoWShedOptions {
  factoryAddress: string
  proxyCreationCode?: string
  implementationAddress: string
  /** EIP-712 domain version used by this deployment. */
  domainVersion?: string
}

export interface ICoWShedCall {
  target: string
  value: bigint
  callData: string
  allowFailure: boolean
  isDelegateCall: boolean
}
