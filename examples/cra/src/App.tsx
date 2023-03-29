import './App.css'
import { SignOrderPage } from './components/signOrder'

const ACTIONS = [{ title: 'Sign order', Component: SignOrderPage }]

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
