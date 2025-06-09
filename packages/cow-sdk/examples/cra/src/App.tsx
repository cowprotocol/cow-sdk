import './App.css'
import { SignOrderPage } from './pages/signOrder'
import { SignOrderCancellationPage } from './pages/signOrderCancellation'
import { GetTradesPage } from './pages/getTrades'
import { GetOrdersPage } from './pages/getOrders'
import { GetQuotePage } from './pages/getQuote'
import { SignAndSendOrderPage } from './pages/sendOrder'
import { SendOrderCancellationPage } from './pages/sendOrderCancellation'
import { FC, useEffect, useState } from 'react'
import { useWeb3Info } from './hooks/useWeb3Info'
import { ChainIdContext } from './context'
import { QuickStartPage } from './pages/quickStart'
import { SmartContractWallet } from './pages/smartContractWallet'
import { GenerateCowShedHookCallDataPage } from './pages/cowShedHook'

const EXAMPLES: ExampleProps[] = [
  { title: 'Quick start', Component: QuickStartPage },
  { title: 'Get quote', Component: GetQuotePage },
  { title: 'Get trades', Component: GetTradesPage },
  { title: 'Get orders', Component: GetOrdersPage },
  { title: 'Sign order', Component: SignOrderPage },
  { title: 'Sign and send order', Component: SignAndSendOrderPage },
  { title: 'Sign order cancellation', Component: SignOrderCancellationPage },
  { title: 'Send order cancellation', Component: SendOrderCancellationPage },
  { title: 'Smart contract wallet', Component: SmartContractWallet },
  { title: 'Generate hook with CoW Shed', Component: GenerateCowShedHookCallDataPage },
]

interface ExampleProps {
  title: string
  Component: FC
  open?: boolean
}

function Example({ open = false, title, Component }: ExampleProps) {
  const [isOpen, setIsOpen] = useState(open)

  return (
    <div key={title} className="section">
      <div onClick={() => setIsOpen((state) => !state)}>{title}</div>
      <div className={isOpen ? 'open' : ''}>
        <Component />
      </div>
    </div>
  )
}

function App() {
  const { chainId } = useWeb3Info()
  const [currentChainId, setCurrentChainId] = useState(chainId)

  useEffect(() => {
    setCurrentChainId(chainId)
  }, [chainId])

  return (
    <div>
      <ChainIdContext.Provider value={currentChainId}>
        <h3>The example works only with Metamask extension!</h3>
        <div className="App">
          <br />
          <div className="chain-id-box">
            <label>ChainId:</label>
            <input name="chainId" value={currentChainId} onChange={(e) => setCurrentChainId(+e.target.value)} />
          </div>
          {EXAMPLES.map((props, index) => {
            return <Example key={index} {...props} open={index === 0} />
          })}
        </div>
      </ChainIdContext.Provider>
    </div>
  )
}

export default App
