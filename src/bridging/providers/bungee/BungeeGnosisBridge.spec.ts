/* This integration test performs a full transaction, therefore is not run as default.

   To run it: `PRIVATE_KEY=XXX yarn test:bungee`
*/

import { SupportedChainId } from '../../../chains'
import { getWallet } from '../../../test/getWallet'
import { OrderKind } from '../../../order-book/generated/models/OrderKind'
import { EvmCall } from '../../../common/types/ethereum'
import { QuoteBridgeRequest } from '../../types'
import { toBridgeQuoteResult } from './util'
import { BungeeQuoteAPIRequest, BungeeQuoteWithBuildTx } from './types'
import { BungeeApi } from './BungeeApi'
import { createBungeeDepositCall } from './createBungeeDepositCall'

// unmock cross-fetch to use the real API
jest.unmock('cross-fetch')

describe('BungeeGnosisBridge full transaction', () => {
  let api: BungeeApi
  let quote: BungeeQuoteAPIRequest
  let txData: BungeeQuoteWithBuildTx
  let call: EvmCall

  beforeAll(() => {
    // Use the real API (not mocked)
    api = new BungeeApi()
  })

  it('builds the tx data for the quote', async () => {
    const wallet = await getWallet(SupportedChainId.MAINNET)
    if (!wallet) {
      console.warn('Wallet not found, skipping test')
      return
    }

    quote = {
      userAddress: `0x${wallet.address}`,
      originChainId: SupportedChainId.MAINNET.toString(),
      destinationChainId: SupportedChainId.GNOSIS_CHAIN.toString(),
      inputToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // dai
      inputAmount: '10000000000000000000', // 10 dai
      receiverAddress: `0x${wallet.address}`,
      outputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // xDAI
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
    }

    txData = await api.getBungeeQuoteWithBuildTx(quote)

    expect(txData).toBeDefined()

    expect(txData.bungeeQuote).toBeDefined()
    expect(txData.bungeeQuote.originChainId).toBe(SupportedChainId.MAINNET)
    expect(txData.bungeeQuote.destinationChainId).toBe(SupportedChainId.GNOSIS_CHAIN)
    expect(txData.bungeeQuote.route).toBeDefined()
    expect(txData.bungeeQuote.routeBridge).toBe('gnosis-native-bridge')

    expect(txData.buildTx).toBeDefined()
    expect(txData.buildTx.txData).toBeDefined()
    expect(txData.buildTx.txData.data).toBeDefined()
    expect(txData.buildTx.txData.to).toBeDefined()
    expect(txData.buildTx.txData.chainId).toBeDefined()
    expect(txData.buildTx.txData.value).toBeDefined()
    expect(txData.buildTx.approvalData).toBeDefined()

    const verify = await api.verifyBungeeBuildTx(txData.bungeeQuote, txData.buildTx, wallet)

    expect(verify).toBe(true)
  })

  it('creates the deposit call', async () => {
    const wallet = await getWallet(SupportedChainId.MAINNET)
    if (!wallet) {
      console.warn('Wallet not found, skipping test')
      return
    }

    const request: QuoteBridgeRequest = {
      kind: OrderKind.SELL,
      amount: BigInt(10000000000000000000),
      owner: `0x${wallet.address}`,
      sellTokenChainId: SupportedChainId.MAINNET,
      sellTokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      sellTokenDecimals: 18,
      buyTokenChainId: SupportedChainId.GNOSIS_CHAIN,
      buyTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      buyTokenDecimals: 18,
      appCode: 'bungee',
      account: `0x${wallet.address}`,
      signer: wallet,
    }

    const quote = toBridgeQuoteResult(request, 100, txData)

    call = await createBungeeDepositCall({
      request,
      quote,
    })

    expect(call).toBeDefined()
    expect(call.data).toBeDefined()
    expect(call.to).toBe('0x936fa1cfd96849329B18b915773E176718A64b95')
    expect(call.value).toBe(0n)
  })
})
