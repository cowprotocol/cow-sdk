import {
  type AccountAddress,
  OrderKind,
  type QuoteAndPost,
  SupportedChainId,
  type TokenInfo,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk'
import { useEffect, useState } from 'react'
import { chainId, cowSdkAdapter, tradingSdk } from '../../cowSdk.ts'
import { createWalletClient, createPublicClient, custom, type Address } from 'viem'
import { sepolia } from 'viem/chains'

const injectedWalletProvider = window.ethereum

const WETH_SEPOLIA = WRAPPED_NATIVE_CURRENCIES[chainId]

const USDC_SEPOLIA: TokenInfo = {
  logoUrl:
    'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png',
  chainId: SupportedChainId.SEPOLIA,
  address: '0xbe72E441BF55620febc26715db68d3494213D8Cb',
  decimals: 18,
  symbol: 'USDC',
  name: 'USDC (test)',
}

export function SwapForm() {
  const [account, setAccount] = useState<AccountAddress | null>(null)

  const [sellAmount, setSellAmount] = useState('0.1')
  const [quoteAndPost, setQuoteAndPost] = useState<QuoteAndPost | null>(null)
  const [swapError, setSwapError] = useState<Error | null>(null)

  const [postedOrderHash, setPostedOrderHash] = useState<string | null>(null)
  const [isOrderPostingInProgress, setIsOrderPostingInProgress] = useState<boolean>(false)

  const [slippagePercent, setSlippagePercent] = useState(0.5)

  const slippageBps = slippagePercent * 100
  const isLoading = isOrderPostingInProgress || Boolean(account && sellAmount && !quoteAndPost)

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
    if (!account) return

    setQuoteAndPost(null)

    tradingSdk
      .getQuote({
        chainId,
        kind: OrderKind.SELL,
        owner: account,
        amount: Math.round(Number(sellAmount) * 10 ** WETH_SEPOLIA.decimals).toString(),
        sellToken: WETH_SEPOLIA.address,
        sellTokenDecimals: WETH_SEPOLIA.decimals,
        buyToken: USDC_SEPOLIA.address,
        buyTokenDecimals: USDC_SEPOLIA.decimals,
        slippageBps,
      })
      .then(setQuoteAndPost)
      .catch(setSwapError)
  }, [slippageBps, sellAmount, account])

  // Connect an injected wallet
  useEffect(() => {
    if (!injectedWalletProvider) return

    const walletClient = createWalletClient({ chain: sepolia, transport: custom(injectedWalletProvider) })

    walletClient.requestAddresses().then((accounts: Address[]) => {
      if (!accounts.length) {
        setSwapError(new Error('Wallet is not connected'))
      }

      const firstAccount = accounts[0]

      setAccount(firstAccount)

      const injectedPublicClient = createPublicClient({ chain: sepolia, transport: custom(injectedWalletProvider) })
      cowSdkAdapter.setProvider(injectedPublicClient)

      const walletWithAccount = createWalletClient({
        chain: sepolia,
        transport: custom(injectedWalletProvider),
        account: firstAccount,
      })

      cowSdkAdapter.setSigner(walletWithAccount.account!)
      tradingSdk.setTraderParams({ signer: walletWithAccount.account! })

      console.log('Connected account: ', firstAccount)
    })
  }, [])

  const buyAmountRaw = quoteAndPost?.quoteResults.amountsAndCosts.afterNetworkCosts.buyAmount
  const buyAmountView = buyAmountRaw ? (Number(buyAmountRaw) / 10 ** USDC_SEPOLIA.decimals).toFixed(6) : undefined

  return injectedWalletProvider ? (
    <div>
      {account && (
        <div className="box">
          Account: <span>{account}</span>
        </div>
      )}

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
        <span>{WETH_SEPOLIA.symbol}</span>
      </div>
      <div className="box">
        <strong>Buy</strong>
        <input type="number" value={buyAmountView ?? 'Loading...'} disabled />
        <span>{USDC_SEPOLIA.symbol}</span>
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
      <h3>Please install any browser extension wallet (Rabby / Metamask / Etc.)</h3>
    </div>
  )
}
