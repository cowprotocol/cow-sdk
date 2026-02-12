import { AdditionalEvmTargetChainId, EvmCall, SupportedEvmChainId, TargetEvmChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { BridgeQuoteResult, BridgeStatus, BridgeStatusResult, BridgingDepositParams } from '../../types'

export const BRIDGING_PARAMS: BridgingDepositParams = {
  inputTokenAddress: '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  outputTokenAddress: '0x000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  inputAmount: 24023409n,
  outputAmount: 24020093n,
  owner: '0x0000000000000000000000002bfcacf7ff137289a2c4841ea90413ab51103032',
  quoteTimestamp: 1747223915,
  fillDeadline: 1747235809,
  recipient: '0x000000000000000000000000bbcf91605c18a9859c1d47abfeed5d2cca7097cf',
  sourceChainId: 1,
  destinationChainId: 8453,
  bridgingId: '2595561',
}

export const MOCK_CALL: EvmCall = {
  to: '0x0000000000000000000000000000000000000001',
  data: '0x0',
  value: BigInt(0),
}

export const BUY_TOKENS = [
  {
    chainId: SupportedEvmChainId.MAINNET,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    chainId: SupportedEvmChainId.MAINNET,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    logoUrl: 'https://swap.cow.fi/assets/network-gnosis-chain-logo-Do_DEWQv.svg',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  {
    chainId: SupportedEvmChainId.SEPOLIA,
    address: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
    logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
    name: 'CoW Protocol Token',
    symbol: 'COW',
    decimals: 18,
  },
  {
    chainId: AdditionalEvmTargetChainId.OPTIMISM,
    address: '0x4200000000000000000000000000000000000006',
    logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
]

export const INTERMEDIATE_TOKENS: Partial<Record<TargetEvmChainId, TokenInfo[]>> = {
  [SupportedEvmChainId.MAINNET]: [
    {
      address: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
      chainId: SupportedEvmChainId.MAINNET,
      name: 'COW',
      symbol: 'COW',
      decimals: 18,
    },
  ],
  [AdditionalEvmTargetChainId.OPTIMISM]: [
    {
      address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      chainId: AdditionalEvmTargetChainId.OPTIMISM,
      name: 'Wrapped BTC ',
      symbol: 'WBTC',
      decimals: 8,
    },
  ],
  [SupportedEvmChainId.SEPOLIA]: [
    {
      address: '0xB4F1737Af37711e9A5890D9510c9bB60e170CB0D',
      chainId: SupportedEvmChainId.SEPOLIA,
      name: 'DAI (test)',
      symbol: 'DAI',
      decimals: 18,
    },
  ],
}

export const QUOTE: BridgeQuoteResult = {
  isSell: true,
  amountsAndCosts: {
    costs: {
      bridgingFee: {
        feeBps: 10,
        amountInSellCurrency: 123456n,
        amountInBuyCurrency: 123456n,
      },
    },
    beforeFee: {
      sellAmount: 123456n,
      buyAmount: 123456n,
    },
    afterFee: {
      sellAmount: 123456n,
      buyAmount: 123456n,
    },
    afterSlippage: {
      sellAmount: 123456n,
      buyAmount: 123456n,
    },
    slippageBps: 0,
  },
  quoteTimestamp: Date.now(),
  expectedFillTimeSeconds: 128,
  fees: {
    bridgeFee: 1n,
    destinationGasFee: 2n,
  },
  limits: {
    minDeposit: 1n,
    maxDeposit: 100_000n,
  },
}

export const STATUS: BridgeStatusResult = {
  status: BridgeStatus.IN_PROGRESS,
  fillTimeInSeconds: 67,
}
