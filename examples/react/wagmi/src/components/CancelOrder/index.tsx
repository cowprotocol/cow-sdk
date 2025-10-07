import { useState } from 'react'
import { useAccount } from 'wagmi'

import { tradingSdk } from '../../cowSdk'

export function CancelOrder({ isSdkReady }: { isSdkReady: boolean }) {
  const { chainId, status } = useAccount()

  const [orderUid, setOrderUid] = useState('')
  const [cancellationMethod, setCancellationMethod] = useState<'offchain' | 'onchain'>('offchain')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const cancelOrder = async () => {
    if (!orderUid || !chainId || !isSdkReady) {
      setError(new Error('Please provide order UID and ensure wallet is connected'))
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (cancellationMethod === 'offchain') {
        // Off-chain cancellation (soft cancel)
        const result = await tradingSdk.offChainCancelOrder({
          orderUid,
          chainId,
        })

        if (result) {
          setSuccessMessage(`Order ${orderUid} cancelled off-chain successfully!`)
        }
      } else {
        // On-chain cancellation (hard cancel)
        const txHash = await tradingSdk.onChainCancelOrder({
          orderUid,
          chainId,
        })

        setSuccessMessage(`Order ${orderUid} cancelled on-chain! Transaction hash: ${txHash}`)
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOrder = async () => {
    if (!orderUid || !chainId || !isSdkReady) {
      setError(new Error('Please provide order UID and ensure wallet is connected'))
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const order = await tradingSdk.getOrder({
        orderUid,
        chainId,
      })

      setSuccessMessage(
        `Order found! Status: ${order.status}, Owner: ${order.owner}, Sell: ${order.sellToken}, Buy: ${order.buyToken}`,
      )
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return status === 'connected' ? (
    <div>
      <h3>Order Management</h3>

      <div className="box">
        <label>
          <strong>Order UID:</strong>
        </label>
        <input
          type="text"
          value={orderUid}
          onChange={(e) => setOrderUid(e.target.value)}
          placeholder="0x..."
          style={{ width: '100%', marginTop: '5px' }}
        />
      </div>

      <div className="box">
        <label>
          <strong>Cancellation Method:</strong>
        </label>
        <div style={{ marginTop: '10px' }}>
          <label style={{ marginRight: '20px' }}>
            <input
              type="radio"
              value="offchain"
              checked={cancellationMethod === 'offchain'}
              onChange={(e) => setCancellationMethod(e.target.value as 'offchain')}
            />
            <span style={{ marginLeft: '5px' }}>Off-chain (Soft Cancel)</span>
          </label>
          <label>
            <input
              type="radio"
              value="onchain"
              checked={cancellationMethod === 'onchain'}
              onChange={(e) => setCancellationMethod(e.target.value as 'onchain')}
            />
            <span style={{ marginLeft: '5px' }}>On-chain (Hard Cancel)</span>
          </label>
        </div>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          <strong>Off-chain:</strong> Faster and free, uses order book.
          <br />
          <strong>On-chain:</strong> An on-chain transaction.
        </p>
      </div>

      {successMessage && (
        <div className="box" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
          {successMessage}
        </div>
      )}

      {error && <div className="box error">{error.message || JSON.stringify(error)}</div>}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button disabled={isLoading || !orderUid} onClick={getOrder}>
          {isLoading ? 'Loading...' : 'Get Order Details'}
        </button>
        <button disabled={isLoading || !orderUid} onClick={cancelOrder}>
          {isLoading ? 'Loading...' : `Cancel Order (${cancellationMethod})`}
        </button>
      </div>

      <div className="box" style={{ marginTop: '20px', fontSize: '0.9em' }}>
        <strong>How to use:</strong>
        <ol style={{ marginTop: '10px' }}>
          <li>First create an order using the Swap form above</li>
          <li>Copy the order UID from the success message</li>
          <li>Paste it here and click "Get Order Details" to verify it exists</li>
          <li>Choose cancellation method and click the cancel button</li>
        </ol>
      </div>
    </div>
  ) : (
    <div>
      <h3>Connect your wallet to manage orders</h3>
    </div>
  )
}
