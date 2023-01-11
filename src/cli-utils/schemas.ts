import { PromptObject } from 'prompts'
import { SupportedChainId } from '../constants/chains'

const commonProperties: PromptObject[] = [
  {
    type: 'select',
    name: 'chainId',
    message: 'Select network',
    choices: [
      { title: 'Ethereum', value: SupportedChainId.MAINNET },
      { title: 'Gnosis chain', value: SupportedChainId.GNOSIS_CHAIN },
      { title: 'Goerli', value: SupportedChainId.GOERLI },
    ],
  },
  {
    type: 'password',
    name: 'privateKey',
    message: 'Enter your private key',
  },
]

export const operationSchema: PromptObject[] = [
  {
    type: 'select',
    name: 'operation',
    choices: [
      { title: 'Sign order', value: 'signOrder' },
      { title: 'Send order', value: 'sendOrder' },
    ],
    message: 'Choose operation:',
  },
]

export const createOrderSchema: PromptObject[] = [
  ...commonProperties,
  {
    type: 'select',
    name: 'kind',
    choices: [
      { title: 'sell', value: 'sell' },
      { title: 'buy', value: 'buy' },
    ],
    message: 'Order kind',
  },
  {
    type: 'select',
    name: 'partiallyFillable',
    choices: [
      { title: 'true', value: true },
      { title: 'false', value: false },
    ],
    message: 'Is partially fillable',
  },
  {
    type: 'number',
    name: 'expiresIn',
    message: 'Expires in seconds, 600 = 10 minutes',
    initial: 600,
  },
  {
    type: 'text',
    name: 'sellToken',
    message: 'Sell tokem address',
  },
  {
    type: 'text',
    name: 'buyToken',
    message: 'Buy token address',
  },
  {
    type: 'text',
    name: 'sellAmount',
    message: 'Sell token amount',
  },
  {
    type: 'text',
    name: 'buyAmount',
    message: 'Buy token amount',
  },
  {
    type: 'text',
    name: 'feeAmount',
    message: 'Fee amount',
  },
  {
    type: 'text',
    name: 'receiver',
    message: 'Receiver address (optional)',
    initial: '',
  },
]
