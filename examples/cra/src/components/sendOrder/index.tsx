import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderSigningUtils, UID, OrderKind, UnsignedOrder, OrderBookApi, SigningScheme } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { parseFormData } from '../../utils'

const orderBookApi = new OrderBookApi()

export function SignAndSendOrderPage() {
  const { chainId, account, provider } = useWeb3Info()
  const [result, setResult] = useState<UID | null>(null)

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const sendOrder = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      const data = parseFormData<{ chainId: string; order: string }>(event)
      const chainId = +data.chainId
      const unsignedOrder: UnsignedOrder = JSON.parse(data.order)
      const signer = provider.getSigner()

      OrderSigningUtils.signOrder(unsignedOrder, chainId, signer)
        .then((signingResult) => {
          return orderBookApi.sendOrder({
            ...unsignedOrder,
            signingScheme: signingResult.signingScheme as string as SigningScheme,
            signature: signingResult.signature,
          })
        })
        .then((orderId) => {
          return orderBookApi.getOrderLink(orderId)
        })
        .then(setResult)
        .catch((error) => {
          setResult(error.toString())
        })
    },
    [provider]
  )

  const order: UnsignedOrder = {
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
      <form className="form" onSubmit={(event) => sendOrder(event)}>
        <div>
          <label>ChainId:</label>
          <input name="chainId" value={chainId} />
        </div>

        <div>
          <label>Order:</label>
          <textarea className="result" name="order" value={JSON.stringify(order, null, 4)}></textarea>
        </div>

        <div>
          <button type="submit">Sign and send order</button>
        </div>
      </form>

      <h3>Result:</h3>
      <textarea className="result" readOnly={true} value={JSON.stringify(result, null, 4)}></textarea>
    </div>
  )
}
