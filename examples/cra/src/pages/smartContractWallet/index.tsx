import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react'

import { Contract } from '@ethersproject/contracts'
import { OrderBookApi, OrderCreation, OrderKind, SigningScheme, UnsignedOrder } from '@cowprotocol/cow-sdk'

import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'

import { SETTLEMENT_CONTRACT_ABI, SETTLEMENT_CONTRACT_ADDRESS } from './const'
import { useSafeSdkAndKit } from './useSafeSdkAndKit'

const appData = '{"appCode":"CoW Swap-SafeApp","environment":"local","metadata":{"orderClass":{"orderClass":"limit"},"quote":{"slippageBips":"0"}},"version":"0.11.0"}'
const appDataHash = '0x6bb009e9730f09d18011327b6a1e4b9df70a3eb4d49e7cb622f79caadac5751a'


const orderBookApi = new OrderBookApi()
const settlementContract = new Contract(SETTLEMENT_CONTRACT_ADDRESS, SETTLEMENT_CONTRACT_ABI)

export function SmartContractWallet() {
  const {provider, account} = useWeb3Info()
  const chainId = useCurrentChainId()

  const [safeAddress, setSafeAddress] = useState<string | null>(null)
  const [input, setInput] = useState<UnsignedOrder | null>(null)
  const [output, setOutput] = useState<any>('')

  const {safeSdk, safeApiKit} = useSafeSdkAndKit(safeAddress, chainId, provider)

  const defaultOrder: UnsignedOrder | null = useMemo(() => {
    return safeAddress ? {
      receiver: safeAddress,
      buyAmount: '650942340000000000000',
      buyToken: '0x91056D4A53E1faa1A84306D4deAEc71085394bC8',
      sellAmount: '100000000000000000',
      sellToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      validTo: Math.round((Date.now() + 900_000) / 1000),
      appData: '0x',
      feeAmount: '0',
      kind: OrderKind.SELL,
      partiallyFillable: true,
      signingScheme: SigningScheme.PRESIGN,
    } : null
  }, [safeAddress])

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])


  const signOrder = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()

      if (!safeAddress) {
        alert('Please, specify Safe address')
        return
      }

      if (!input || !safeSdk || !safeApiKit) return

      setOutput('Loading...')

      try {
        const orderCreation: OrderCreation = {
          ...input,
          from: safeAddress,
          signingScheme: SigningScheme.PRESIGN,
          signature: safeAddress,
          appData,
          appDataHash,
        }

        // Send order to CoW Protocol order-book
        const orderId = await orderBookApi.sendOrder(orderCreation)

        const presignCallData = settlementContract.interface.encodeFunctionData('setPreSignature', [
          orderId,
          true,
        ])

        const presignRawTx = {
          to: settlementContract.address,
          data: presignCallData,
          value: '0',
        }

        // Sending pre-signature transaction to settlement contract
        // In this example we are using the Safe SDK, but you can use any other smart-contract wallet
        const safeTx = await safeSdk.createTransaction({safeTransactionData: presignRawTx})
        const signedSafeTx = await safeSdk.signTransaction(safeTx)
        const safeTxHash = await safeSdk.getTransactionHash(signedSafeTx)
        const senderSignature = signedSafeTx.signatures.get(account.toLowerCase())?.data || ''

        await safeApiKit.proposeTransaction({
          safeAddress,
          safeTransactionData: signedSafeTx.data,
          safeTxHash,
          senderAddress: account,
          senderSignature,
        })

        setOutput({ orderId, safeTxHash, senderSignature })
      } catch (e: any) {
        setOutput(e.toString())
      }
    },
    [chainId, input, provider, setOutput, safeSdk, safeApiKit]
  )

  return (
    <div>
      <div className="form">
        <div>
          <h1>Safe address:</h1>
          <input type="text"
                 style={{width: '600px'}}
                 value={safeAddress || ''}
                 onChange={e => setSafeAddress(e.target.value)}/>

          <h1>Order:</h1>
          <JsonContent defaultValue={defaultOrder} onChange={setInput}/>
        </div>

        <div>
          <button onClick={signOrder}>Sign and send order</button>
        </div>
      </div>

      <ResultContent data={output}/>
    </div>
  )
}
