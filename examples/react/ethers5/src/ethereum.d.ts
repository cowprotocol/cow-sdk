export interface EthereumProvider {
  request<T>(params: { method: string; params?: unknown[] }): Promise<T>
  enable?(): Promise<string[] | undefined>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}
