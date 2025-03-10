export interface EvmCall {
  to: string
  data: string
  value: string
  isDelegateCall?: boolean
}
