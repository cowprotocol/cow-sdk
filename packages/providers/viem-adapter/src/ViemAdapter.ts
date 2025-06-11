import { createPublicClient, http, PublicClient, Account, Transport, Chain } from 'viem'

import { AdapterTypes, AbstractProviderAdapter } from '@cowprotocol/sdk-common'

export interface ViemTypes extends AdapterTypes {
  Bytes: `0x${string}`
}
import { ViemUtils } from './ViemUtils'

export class ViemAdapter extends AbstractProviderAdapter<ViemTypes> {
  declare protected _type?: ViemTypes
  private publicClient: PublicClient
  private account?: Account
  public utils: ViemUtils

  constructor(chain: Chain, transport: Transport = http(), account?: Account | `0x${string}`) {
    super()
    this.publicClient = createPublicClient({
      chain,
      transport,
    })

    if (account) {
      this.account = typeof account === 'string' ? ({ address: account } as Account) : account
    }

    this.utils = new ViemUtils()
  }

  async getChainId(): Promise<number> {
    return this.publicClient.chain?.id ?? 0
  }

  async getAddress(): Promise<string> {
    if (!this.account) {
      throw new Error('No account provided')
    }
    return this.account.address
  }
}
