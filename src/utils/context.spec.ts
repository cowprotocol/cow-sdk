import { Context } from './context'
import { VoidSigner } from '@ethersproject/abstract-signer'
import { Provider } from '@ethersproject/providers'

test('Context: update chainId', async () => {
  const context = new Context(1, {})
  let chainId = await context.chainId
  expect(chainId).toEqual(1)

  // works
  chainId = await context.updateChainId(100)
  expect(chainId).toEqual(100)
})

test('Context: update chainId fails', () => {
  const context = new Context(1, {})

  expect(() => {
    context.updateChainId(123)
  }).toThrow('Invalid chainId: 123')
})

test('Context: get chainId from provider - matches context', async () => {
  const mockProvider = jest.fn<Provider, []>()
  const provider = new mockProvider()
  provider.getNetwork = jest.fn(async () => ({ chainId: 1, name: 'bla' }))

  const signer = new VoidSigner('', provider)

  const context = new Context(1, { signer })

  const chainId = await context.chainId

  expect(chainId).toEqual(1)
  expect(provider.getNetwork).toHaveBeenCalledTimes(1)
})

test('Context: get chainId from provider - differs from context', async () => {
  const mockProvider = jest.fn<Provider, []>()
  const provider = new mockProvider()
  provider.getNetwork = jest.fn(async () => ({ chainId: 100, name: 'bla' }))

  const signer = new VoidSigner('', provider)

  const context = new Context(1, { signer })

  const chainId = await context.chainId

  expect(chainId).toEqual(100)
  expect(provider.getNetwork).toHaveBeenCalledTimes(1)
})
