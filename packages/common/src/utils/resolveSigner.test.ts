import { setGlobalAdapter } from '../adapters'
import { resolveSigner } from './resolveSigner'

describe('resolveSigner', () => {
  test('falls back only when no signer was supplied', () => {
    const defaultSigner = {}
    const resolvedSigner = {}
    const createSigner = jest.fn().mockReturnValue(resolvedSigner)
    setGlobalAdapter({ signer: defaultSigner, createSigner } as never)

    expect(resolveSigner()).toBe(defaultSigner)
    expect(resolveSigner('')).toBe(resolvedSigner)
    expect(createSigner).toHaveBeenCalledWith('')
  })
})
