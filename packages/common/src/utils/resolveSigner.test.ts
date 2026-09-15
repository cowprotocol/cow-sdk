import { getGlobalAdapter } from '../adapters'
import { resolveSigner } from './resolveSigner'

jest.mock('../adapters', () => ({
  ...jest.requireActual('../adapters'),
  getGlobalAdapter: jest.fn(),
}))

describe('resolveSigner', () => {
  test('falls back only when no signer was supplied', () => {
    const defaultSigner = {}
    const resolvedSigner = {}
    const createSigner = jest.fn().mockReturnValue(resolvedSigner)
    jest.mocked(getGlobalAdapter).mockReturnValue({ signer: defaultSigner, createSigner } as never)

    expect(resolveSigner()).toBe(defaultSigner)
    expect(resolveSigner('')).toBe(resolvedSigner)
    expect(createSigner).toHaveBeenCalledWith('')
  })
})
