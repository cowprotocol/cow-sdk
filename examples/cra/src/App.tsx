import './App.css'
import { OrderBookApi, SupportedChainId, EnrichedOrder } from '@cowprotocol/cow-sdk'
import { useEffect, useState } from 'react'

function App() {
  const [order, setOrder] = useState<EnrichedOrder | null>(null)

  useEffect(() => {
    const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.MAINNET })

    orderBookApi
      .getOrder(
        '0xff2e2e54d178997f173266817c1e9ed6fee1a1aae4b43971c53b543cffcc2969845c6f5599fbb25dbdd1b9b013daf85c03f3c63763e4bc4a'
      )
      .then(setOrder)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>Order:</p>
        <textarea className="orderData" value={JSON.stringify(order, null, 4)}></textarea>
      </header>
    </div>
  )
}

export default App
