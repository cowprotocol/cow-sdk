import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { SwapForm } from './components/SwapForm'
import { useBindCoWSdkToWagmi } from './hooks/useBindCoWSdkToWagmi.ts'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  const isSdkReady = useBindCoWSdkToWagmi()

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button key={connector.uid} onClick={() => connect({ connector })} type="button">
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <h2>Swap</h2>
      {<SwapForm isSdkReady={isSdkReady} />}
    </>
  )
}

export default App
