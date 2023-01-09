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
      { title: 'create', value: 'create' },
      { title: 'send', value: 'send' },
    ],
    message: 'Choose operation for limit order RFQ: create, fill, cancel',
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
    message: 'Maker asset address',
  },
  {
    type: 'text',
    name: 'buyToken',
    message: 'Taker asset address',
  },
  {
    type: 'text',
    name: 'sellAmount',
    message: 'Maker asset amount',
  },
  {
    type: 'text',
    name: 'buyAmount',
    message: 'Taker asset amount',
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
