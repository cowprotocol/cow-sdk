import fetchMock from 'jest-fetch-mock'
import { generateTestingUtils } from 'eth-testing'

jest.setMock('cross-fetch', fetchMock)
jest.setMock('loglevel', { debug: jest.fn(), error: jest.fn(), info: jest.fn() })
jest.mock('@gnosis.pm/gp-v2-contracts')

const testingUtils = generateTestingUtils({ providerType: 'MetaMask' })

global.window = global
global.window.ethereum = testingUtils.getProvider()
