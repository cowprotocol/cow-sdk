import { FormEvent, useCallback, useState } from 'react'
import '../../pageStyles.css'
import { OrderSigningUtils, SigningResult, OrderKind, UnsignedOrder } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { parseFormData } from '../../utils'

export function SignOrderPage() {
  const { chainId, account, provider } = useWeb3Info()
  const [result, setResult] = useState<SigningResult | null>(null)

  const signOrder = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      const data = parseFormData<{ chainId: string; order: string }>(event)
      const chainId = +data.chainId
      const unsignedOrder: UnsignedOrder = JSON.parse(data.order)
      const signer = provider.getSigner()

      OrderSigningUtils.signOrder(unsignedOrder, chainId, signer)
        .then(setResult)
        .catch((error) => {
          setResult(error.toString())
        })
    },
    [provider]
  )

  const order: UnsignedOrder = {
    sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    receiver: account,
    sellAmount: '2',
    buyAmount: '1',
    validTo: Math.round((Date.now() + 200_000) / 1000),
    appData: '0x',
    feeAmount: '0',
    kind: OrderKind.SELL,
    partiallyFillable: false,
  }

  return (
    <div>
      <form className="form" onSubmit={(event) => signOrder(event)}>
        <div>
          <label>ChainId:</label>
          <input name="chainId" value={chainId} />
        </div>

        <div>
          <label>Order:</label>
          <textarea className="result" name="order" value={JSON.stringify(order, null, 4)}></textarea>
        </div>

        <div>
          <button type="submit">Sign order</button>
        </div>
      </form>

      <h3>Result:</h3>
      <textarea className="result" readOnly={true} value={JSON.stringify(result, null, 4)}></textarea>
    </div>
  )
}
