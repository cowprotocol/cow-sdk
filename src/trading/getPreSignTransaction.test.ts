const GAS = '0x1e848' // 125000

jest.mock('cross-fetch', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetchMock = require('jest-fetch-mock')
  // Require the original module to not be mocked...
  const originalFetch = jest.requireActual('cross-fetch')
  return {
    __esModule: true,
    ...originalFetch,
    default: fetchMock,
  }
})
jest.mock('../common/generated', () => {
  const original = jest.requireActual('../common/generated')

  return {
    ...original,
    GPv2Settlement__factory: {
      connect: jest.fn().mockReturnValue({
        address: '0xaa1',
        estimateGas: {
          setPreSignature: jest.fn().mockResolvedValue({ toHexString: () => GAS }),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue('0x0ac'),
        },
      }),
    },
  }
})

import { SupportedChainId } from '../common'
import { VoidSigner } from '@ethersproject/abstract-signer'
import { getPreSignTransaction } from './getPreSignTransaction'

const chainId = SupportedChainId.GNOSIS_CHAIN
const account = '0x21c3de23d98caddc406e3d31b25e807addf33333'
const orderId =
  '0xd64389693b6cf89ad6c140a113b10df08073e5ef3063d05a02f3f42e1a42f0ad0b7795e18767259cc253a2af471dbc4c72b49516ffffffff'

describe('getPreSignTransaction', () => {
  const signer = new VoidSigner(account)

  signer.getChainId = jest.fn().mockResolvedValue(chainId)
  signer.getAddress = jest.fn().mockResolvedValue(account)

  it('Should call gas estimation and return estimated value + 20%', async () => {
    const result = await getPreSignTransaction(signer, chainId, account, orderId)
    const gasNum = +GAS

    expect(+result.gas).toBe(gasNum * 1.2)
  })

  it('Tx value should always be zero', async () => {
    const result = await getPreSignTransaction(signer, chainId, account, orderId)

    expect(result.value).toBe('0')
  })
})
