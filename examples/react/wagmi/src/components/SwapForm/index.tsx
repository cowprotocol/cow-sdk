import {
  isSupportedChain,
  NATIVE_CURRENCY_ADDRESS,
  OrderKind,
  type QuoteAndPost,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk'
import { useEffect, useState } from 'react'
import { tradingSdk } from '../../cowSdk'
import { useAccount } from 'wagmi'
import { USDC_TOKENS } from '../../tokens.ts'
import { formatUnits, parseUnits } from 'viem'

export function SwapForm({ isSdkReady }: { isSdkReady: boolean }) {
  const { address: account, chainId, status } = useAccount()

  const [sellAmount, setSellAmount] = useState('0.1')
  const [quoteAndPost, setQuoteAndPost] = useState<QuoteAndPost | null>(null)
  const [swapError, setSwapError] = useState<Error | null>(null)

  const [postedOrderHash, setPostedOrderHash] = useState<string | null>(null)
  const [isOrderPostingInProgress, setIsOrderPostingInProgress] = useState<boolean>(false)

  const [slippagePercent, setSlippagePercent] = useState(0.5)
  const [sellTokenType, setSellTokenType] = useState<'WETH' | 'ETH'>('WETH')

  const slippageBps = slippagePercent * 100
  const isLoading = isOrderPostingInProgress || Boolean(account && sellAmount && !quoteAndPost)

  const WETH = chainId && isSupportedChain(chainId) ? WRAPPED_NATIVE_CURRENCIES[chainId] : null
  const USDC = chainId && isSupportedChain(chainId) ? USDC_TOKENS[chainId] : null
  const sellToken =
    WETH && sellTokenType === 'ETH' ? { ...WETH, symbol: 'ETH' as const, address: NATIVE_CURRENCY_ADDRESS } : WETH

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

    if (!sellToken || !USDC) return

    setQuoteAndPost(null)

    tradingSdk
      .getQuote({
        chainId,
        kind: OrderKind.SELL,
        owner: account,
        amount: parseUnits(sellAmount, sellToken.decimals).toString(),
        sellToken: sellToken.address,
        sellTokenDecimals: sellToken.decimals,
        buyToken: USDC.address,
        buyTokenDecimals: USDC.decimals,
        slippageBps,
      })
      .then((quote) => {
        setQuoteAndPost(quote)
        setSwapError(null)
      })
      .catch(setSwapError)
  }, [slippageBps, sellAmount, chainId, account, isSdkReady, sellTokenType])

  const buyAmountRaw = quoteAndPost?.quoteResults.amountsAndCosts.afterNetworkCosts.buyAmount
  const buyAmountView = buyAmountRaw && USDC ? Number(formatUnits(buyAmountRaw, USDC.decimals)).toFixed(6) : undefined

  return status === 'connected' ? (
    <div>
      {postedOrderHash && (
        <div className="box" style={{ backgroundColor: '#d4edda' }}>
          <h4>Order has been posted!</h4>
          <p>
            <strong>Order UID:</strong>
            <br />
            <code style={{ wordBreak: 'break-all', fontSize: '0.9em' }}>{postedOrderHash}</code>
          </p>
          <p>
            <a href={`https://explorer.cow.fi/orders/${postedOrderHash}`} target="_blank" rel="noopener noreferrer">
              View in CoW Explorer
            </a>
          </p>
          <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
            Copy the Order UID above to manage this order in the "Order Management" section below.
          </p>
        </div>
      )}

      <div className="box">
        <strong>Sell Token:</strong>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            value="WETH"
            checked={sellTokenType === 'WETH'}
            onChange={(e) => setSellTokenType(e.target.value as 'WETH')}
          />
          <span style={{ marginLeft: '5px' }}>WETH</span>
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            value="ETH"
            checked={sellTokenType === 'ETH'}
            onChange={(e) => setSellTokenType(e.target.value as 'ETH')}
          />
          <span style={{ marginLeft: '5px' }}>ETH (Native)</span>
        </label>
      </div>

      <div className="box">
        <strong>Sell</strong>
        <input type="number" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
        <span>{sellToken?.symbol}</span>
      </div>
      <div className="box">
        <strong>Buy</strong>
        <input type="number" value={buyAmountView ?? 'Loading...'} disabled />
        <span>{USDC?.symbol}</span>
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
