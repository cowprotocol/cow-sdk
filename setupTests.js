import fetchMock from 'jest-fetch-mock'
import log from 'logLevel'
import { generateTestingUtils } from 'eth-testing'

jest.setMock('cross-fetch', fetchMock)
jest.mock('@gnosis.pm/gp-v2-contracts')

const testingUtils = generateTestingUtils({ providerType: 'MetaMask' })
testingUtils.mockChainId('0x4') //Rinkeby

global.window = global
global.window.ethereum = testingUtils.getProvider()

log.info = jest.fn
log.debug = jest.fn
log.error = jest.fn
log.setLevel = jest.fn
