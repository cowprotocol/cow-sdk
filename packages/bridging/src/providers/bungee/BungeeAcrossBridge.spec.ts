/* This integration test performs a full transaction, therefore is not run as default.

   To run it: `PRIVATE_KEY=XXX yarn test:bungeeAcrossBridge`
*/

import { QuoteBridgeRequest } from '../../types'
import { toBridgeQuoteResult } from './util'
import { BungeeQuoteAPIRequest, BungeeQuoteWithBuildTx } from './types'
import { BungeeApi } from './BungeeApi'
import { createBungeeDepositCall } from './createBungeeDepositCall'
import { EvmCall, SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { AccountAddress, getGlobalAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'
import { getWallet } from '../../test'
import { createAdapters } from '../../../tests/setup'

// unmock cross-fetch to use the real API
jest.unmock('cross-fetch')

describe.skip('BungeeAcrossBridge full transaction', () => {
  let api: BungeeApi
  let quote: BungeeQuoteAPIRequest
  let txData: BungeeQuoteWithBuildTx
  let call: EvmCall

  beforeAll(() => {
    // Use the real API (not mocked)
    api = new BungeeApi()
  })

  it('builds the tx data for the quote', async () => {
    const wallet = await getWallet(SupportedEvmChainId.MAINNET)
    if (!wallet) {
      console.warn('Wallet not found, skipping test')
      return
    }

    const adapters = createAdapters()

    setGlobalAdapter(adapters.ethersV5Adapter)
    getGlobalAdapter().setSigner(wallet)

    quote = {
      userAddress: `${wallet.address}`,
      originChainId: SupportedEvmChainId.ARBITRUM_ONE.toString(),
      destinationChainId: SupportedEvmChainId.BASE.toString(),
      inputToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
      inputAmount: '1000000', // 1 USDC
      receiverAddress: `${wallet.address}`,
      outputToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on base
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
      includeBridges: ['across'],
    }

    txData = await api.getBungeeQuoteWithBuildTx(quote)

    expect(txData).toBeDefined()

    expect(txData.bungeeQuote).toBeDefined()
    expect(txData.bungeeQuote.originChainId).toBe(SupportedEvmChainId.ARBITRUM_ONE)
    expect(txData.bungeeQuote.destinationChainId).toBe(SupportedEvmChainId.BASE)
    expect(txData.bungeeQuote.route).toBeDefined()
    expect(txData.bungeeQuote.routeBridge).toBe('across')

    expect(txData.buildTx).toBeDefined()
    expect(txData.buildTx.txData).toBeDefined()
    expect(txData.buildTx.txData.data).toBeDefined()
    expect(txData.buildTx.txData.to).toBeDefined()
    expect(txData.buildTx.txData.chainId).toBeDefined()
    expect(txData.buildTx.txData.value).toBeDefined()
    expect(txData.buildTx.approvalData).toBeDefined()

    const verify = await api.verifyBungeeBuildTx(txData.bungeeQuote, txData.buildTx)

    expect(verify).toBe(true)
  })

  it('creates the deposit call', async () => {
    const wallet = await getWallet(SupportedEvmChainId.MAINNET)
    if (!wallet) {
      console.warn('Wallet not found, skipping test')
      return
    }

    const request: QuoteBridgeRequest = {
      kind: OrderKind.SELL,
      amount: BigInt(1000000),
      owner: wallet.address as AccountAddress,
      sellTokenChainId: SupportedEvmChainId.ARBITRUM_ONE,
      sellTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      sellTokenDecimals: 6,
      buyTokenChainId: SupportedEvmChainId.BASE,
      buyTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      buyTokenDecimals: 6,
      appCode: 'bungee',
      account: wallet.address as AccountAddress,
      signer: wallet,
    }

    const quote = toBridgeQuoteResult(request, 100, txData)

    call = await createBungeeDepositCall({
      request,
      quote,
    })

    expect(call).toBeDefined()
    expect(call.data).toBeDefined()
    expect(call.to).toBe('0xD06a673fe1fa27B1b9E5BA0be980AB15Dbce85cc')
    expect(call.value).toBe(0n)
  })
})
