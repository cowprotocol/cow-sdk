import './App.css'
import { SignOrderPage } from './components/signOrder'
import { SignOrderCancellationPage } from './components/signOrderCancellation'
import { GetTradesPage } from './components/getTrades'

const ACTIONS = [
  { title: 'Sign order', Component: SignOrderPage },
  { title: 'Sign order cancellation', Component: SignOrderCancellationPage },
  { title: 'Get trades', Component: GetTradesPage },
]

function App() {
  return (
    <div className="App">
      {ACTIONS.map(({ title, Component }) => {
        return (
          <div key={title} className="section">
            <div>{title}</div>
            <div>
              <Component />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default App
