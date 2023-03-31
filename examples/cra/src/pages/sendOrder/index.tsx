import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderSigningUtils, UID, OrderKind, UnsignedOrder, OrderBookApi, SigningScheme } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'

const orderBookApi = new OrderBookApi()

export function SignAndSendOrderPage() {
  const { account, provider } = useWeb3Info()
  const chainId = useCurrentChainId()

  const [input, setInput] = useState<UnsignedOrder | null>(null)
  const [output, setOutput] = useState<UID | string>('')

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const sendOrder = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      if (!input) return

      setOutput('Loading...')

      const signer = provider.getSigner()

      OrderSigningUtils.signOrder(input, chainId, signer)
        .then((signingResult) => {
          return orderBookApi.sendOrder({
            ...input,
            signingScheme: signingResult.signingScheme as string as SigningScheme,
            signature: signingResult.signature,
          })
        })
        .then((orderId) => {
          return orderBookApi.getOrderLink(orderId)
        })
        .then(setOutput)
        .catch((error) => {
          setOutput(error.toString())
        })
    },
    [input, chainId, provider]
  )

  const defaultValue: UnsignedOrder = {
    sellToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    buyToken: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    receiver: account,
    sellAmount: '100000000000000000',
    buyAmount: '6677405170898827136',
    validTo: Math.round((Date.now() + 200_000) / 1000),
    appData: '0x828569F802B7F8957F76996BDD875674821E41A688541A9E9EC97D5E897D44A7',
    feeAmount: '0',
    kind: OrderKind.SELL,
    partiallyFillable: false,
  }

  return (
    <div>
      <div className="form">
        <div>
          <h1>Order:</h1>
          <JsonContent defaultValue={defaultValue} onChange={setInput} />
        </div>

        <div>
          <button onClick={sendOrder}>Sign and send order</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
