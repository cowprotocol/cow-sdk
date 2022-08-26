import { SupportedChainId } from '../constants/chains'
import { NATIVE, WRAPPED_NATIVE_TOKEN } from '../constants/tokens'
import { toErc20Address } from './tokens'

test('Wrap to erc20 native token symbol', async () => {
  const chainId = 1 as SupportedChainId
  const wrappedNativeToken = WRAPPED_NATIVE_TOKEN[chainId]
  const checkedAddress = toErc20Address(NATIVE[chainId], chainId)
  expect(checkedAddress).toEqual(wrappedNativeToken.address)
})

test('Wrap to erc20 to token address', async () => {
  const chainId = 1 as SupportedChainId
  const wrappedNativeToken = WRAPPED_NATIVE_TOKEN[chainId]
  const checkedAddress = toErc20Address(wrappedNativeToken.address, chainId)
  expect(checkedAddress).toEqual(wrappedNativeToken.address)
})
