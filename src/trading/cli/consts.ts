import { PromptObject } from 'prompts'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '../../common'
import { OrderKind } from '../../order-book'

export const traderParametersSchema: PromptObject[] = [
  {
    type: 'select',
    name: 'chainId',
    message: 'Network',
    choices: ALL_SUPPORTED_CHAIN_IDS.map((key) => ({
      title: key.toString(),
      value: SupportedChainId[key],
    })),
    initial: SupportedChainId.MAINNET,
  },
  {
    type: 'password',
    name: 'signer',
    message: 'Signer`s private key',
  },
  {
    type: 'text',
    name: 'appCode',
    message: 'Your app code (for analytics purposes)',
  },
]

export const tradeBaseParametersSchema: PromptObject[] = [
  {
    type: 'select',
    name: 'orderKind',
    choices: [
      { title: 'Sell', value: OrderKind.SELL },
      { title: 'Buy', value: OrderKind.BUY },
    ],
    message: 'Order kind',
  },
  {
    type: 'text',
    name: 'sellToken',
    message: 'Sell token address',
  },
  {
    type: 'number',
    name: 'sellTokenDecimals',
    message: 'Sell token decimals',
  },
  {
    type: 'text',
    name: 'buyToken',
    message: 'Buy token address',
  },
  {
    type: 'number',
    name: 'buyTokenDecimals',
    message: 'Buy token decimals',
  },
  {
    type: 'text',
    name: 'amount',
    message: 'Amount to trade (in units)',
  },
]

export const tradeOptionalParametersSchema: PromptObject[] = [
  {
    type: 'select',
    name: 'env',
    choices: [
      { title: 'Prod', value: 'prod' },
      { title: 'Staging', value: 'staging' },
    ],
    message: 'Environment',
  },
  {
    type: 'toggle',
    name: 'partiallyFillable',
    message: 'Is order partially fillable?',
    initial: false,
  },
  {
    type: 'number',
    name: 'slippageBps',
    message: 'Slippage in BPS',
    initial: 0,
  },
  {
    type: 'text',
    name: 'receiver',
    message: 'Receiver address',
    initial: '',
  },
  {
    type: 'number',
    name: 'validFor',
    message: 'Order time to life (in seconds)',
    initial: 300,
    format: (val) => +val,
  },
  {
    type: 'number',
    name: 'partnerFeeBps',
    message: 'Partner fee percent (in BPS)',
    initial: 0,
  },
  {
    type: 'text',
    name: 'partnerFeeRecipient',
    message: 'Partner fee recipient address',
    initial: '',
  },
]

export const limitSpecificParametersSchema: PromptObject[] = [
  {
    type: 'text',
    name: 'sellAmount',
    message: 'Sell amount (in units)',
  },
  {
    type: 'text',
    name: 'buyAmount',
    message: 'Buy amount  (in units)',
  },
]

export const orderToSignParametersSchema: PromptObject[] = [
  {
    type: 'text',
    name: 'from',
    message: 'Account address',
  },
  {
    type: 'text',
    name: 'networkCostsAmount',
    message: 'Network costs amount (in units) (from quote result)',
  },
]

export const actionsSchema: PromptObject[] = [
  {
    type: 'select',
    name: 'action',
    choices: [
      { title: 'Get quote', value: 'getQuote' },
      { title: 'Post swap order', value: 'postSwapOrder' },
      { title: 'Post limit order', value: 'postLimitOrder' },
      { title: 'Get order to sign', value: 'getOrderToSign' },
    ],
    message: 'Choose action to do:',
  },
]

export const swapParametersSchema = [
  ...traderParametersSchema,
  ...tradeBaseParametersSchema,
  ...tradeOptionalParametersSchema,
]

export const limitParametersSchema = [
  ...traderParametersSchema,
  ...tradeBaseParametersSchema.filter((p) => p.name !== 'amount'),
  ...limitSpecificParametersSchema,
  ...tradeOptionalParametersSchema,
]
