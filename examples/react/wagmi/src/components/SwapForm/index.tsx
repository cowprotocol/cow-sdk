import { isSupportedChain, OrderKind, type QuoteAndPost, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk'
import { useEffect, useState } from 'react'
import { tradingSdk } from '../../cowSdk'
import { useAccount } from 'wagmi'
import { USDC_TOKENS } from '../../tokens.ts'

export function SwapForm({ isSdkReady }: { isSdkReady: boolean }) {
  const { address: account, chainId, status } = useAccount()

  const [sellAmount, setSellAmount] = useState('0.1')
  const [quoteAndPost, setQuoteAndPost] = useState<QuoteAndPost | null>(null)
  const [swapError, setSwapError] = useState<Error | null>(null)

  const [postedOrderHash, setPostedOrderHash] = useState<string | null>(null)
  const [isOrderPostingInProgress, setIsOrderPostingInProgress] = useState<boolean>(false)

  const [slippagePercent, setSlippagePercent] = useState(0.5)

  const slippageBps = slippagePercent * 100
  const isLoading = isOrderPostingInProgress || Boolean(account && sellAmount && !quoteAndPost)

  const WETH_SEPOLIA = chainId && isSupportedChain(chainId) ? WRAPPED_NATIVE_CURRENCIES[chainId] : null
  const USDC_SEPOLIA = chainId && isSupportedChain(chainId) ? USDC_TOKENS[chainId] : null

  const postOrder = () => {
    if (!quoteAndPost) return

    setIsOrderPostingInProgress(true)

    quoteAndPost
      .postSwapOrderFromQuote({
        appData: {
          metadata: {
            quote: {
              slippageBips: slippageBps,
            },
          },
        },
      })
      .then((response) => {
        if (!response) {
          setSwapError(new Error('No response from order posting'))
          return
        }
        setPostedOrderHash(response.orderId)
      })
      .catch(setSwapError)
      .finally(() => {
        setIsOrderPostingInProgress(false)
      })
  }

  // Update quote
  useEffect(() => {
    const sellAmountNum = Number(sellAmount)

    if (!isSdkReady) return

    if (!chainId || !account || Number.isNaN(sellAmountNum) || sellAmountNum <= 0) return

    if (!WETH_SEPOLIA || !USDC_SEPOLIA) return

    setQuoteAndPost(null)

    tradingSdk
      .getQuote({
        chainId,
        kind: OrderKind.SELL,
        owner: account,
        amount: Math.round(sellAmountNum * 10 ** WETH_SEPOLIA.decimals).toString(),
        sellToken: WETH_SEPOLIA.address,
        sellTokenDecimals: WETH_SEPOLIA.decimals,
        buyToken: USDC_SEPOLIA.address,
        buyTokenDecimals: USDC_SEPOLIA.decimals,
        slippageBps,
      })
      .then((quote) => {
        setQuoteAndPost(quote)
        setSwapError(null)
      })
      .catch(setSwapError)
  }, [slippageBps, sellAmount, chainId, account, isSdkReady])

  const buyAmountRaw = quoteAndPost?.quoteResults.amountsAndCosts.afterNetworkCosts.buyAmount
  const buyAmountView =
    buyAmountRaw && USDC_SEPOLIA ? (Number(buyAmountRaw) / 10 ** USDC_SEPOLIA.decimals).toFixed(6) : undefined

  return status === 'connected' ? (
    <div>
      {postedOrderHash && (
        <div className="box">
          <h4>Order has been posted</h4>
          <p>
            <a href={`https://explorer.cow.fi/sepolia/orders/${postedOrderHash}`}>See details in Explorer</a>
          </p>
        </div>
      )}

      <div className="box">
        <strong>Sell</strong>
        <input type="number" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
        <span>{WETH_SEPOLIA?.symbol}</span>
      </div>
      <div className="box">
        <strong>Buy</strong>
        <input type="number" value={buyAmountView ?? 'Loading...'} disabled />
        <span>{USDC_SEPOLIA?.symbol}</span>
      </div>

      <div className="box">
        <label>Slippage:</label>
        <input
          type="number"
          value={slippagePercent}
          min={0}
          max={10}
          step={0.5}
          onChange={(e) => setSlippagePercent(+e.target.value)}
        />
        <span>%</span>
      </div>

      {swapError && <div className="box error">{swapError.message || JSON.stringify(swapError)}</div>}

      <button disabled={isLoading} onClick={postOrder}>
        {isLoading ? 'Loading...' : 'Post order'}
      </button>
    </div>
  ) : (
    <div>
      <h3>Wallet status: {status}</h3>
    </div>
  )
}
