import { SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { getPreSignTransaction } from './getPreSignTransaction'
import { createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

const GAS = '0x1e848' // 125000

jest.mock('@cowprotocol/sdk-common', () => {
  const original = jest.requireActual('@cowprotocol/sdk-common')

  return {
    ...original,
    ContractFactory: {
      createSettlementContract: jest.fn().mockReturnValue({
        address: '0xaa1',
        estimateGas: {
          setPreSignature: jest.fn().mockResolvedValue(BigInt(125000)), // Retorna BigInt diretamente
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue('0x0ac'),
        },
      }),
    },
  }
})

const chainId = SupportedEvmChainId.GNOSIS_CHAIN
const orderId =
  '0xd64389693b6cf89ad6c140a113b10df08073e5ef3063d05a02f3f42e1a42f0ad0b7795e18767259cc253a2af471dbc4c72b49516ffffffff'

describe('getPreSignTransaction', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  it('Should call gas estimation and return estimated value + 20%', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const result = await getPreSignTransaction(adapters[adapterName], chainId, orderId)
      results.push(result)
    }

    const gasNum = +GAS

    results.forEach((result) => {
      expect(+result.gasLimit).toBe(gasNum * 1.2)
    })
  })

  it('Tx value should always be zero', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const result = await getPreSignTransaction(adapters[adapterName], chainId, orderId)
      results.push(result)
    }

    results.forEach((result) => {
      expect(result.value).toBe('0')
    })
  })
})
