import { TokenInfo } from '../types/tokens'
import { NATIVE_CURRENCY_ADDRESS } from './addresses'
import { TOKEN_LIST_IMAGES_PATH } from './paths'

/**
 * Just a base template for the native currency, handy to define new networks.
 */
export const nativeCurrencyTemplate: Omit<TokenInfo, 'chainId'> = {
  address: NATIVE_CURRENCY_ADDRESS,
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
  logoUrl: `${TOKEN_LIST_IMAGES_PATH}/1/${NATIVE_CURRENCY_ADDRESS.toLowerCase()}/logo.png`,
}
