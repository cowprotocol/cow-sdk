import { buildAppData, generateAppDataFromDoc } from './appDataUtils'
import { createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

describe('AppData utils', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  it('Should add all required parameters to the doc', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const data = await buildAppData({
        slippageBps: 100,
        appCode: 'cowswap',
        orderClass: 'market',
      })
      results.push(data)
    }

    results.forEach((data) => {
      const parsedData = JSON.parse(data.fullAppData)
      expect(parsedData.metadata.quote.slippageBips).toBe(100)
      expect(parsedData.appCode).toBe('cowswap')
      expect(parsedData.metadata.orderClass.orderClass).toBe('market')
    })
  })

  it('Should add advanced parameters to the doc', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const data = await buildAppData(
        {
          slippageBps: 100,
          appCode: 'cowswap',
          orderClass: 'market',
        },
        {
          environment: 'staging',
          metadata: {
            partnerFee: {
              volumeBps: 66,
              recipient: '0xccc',
            },
            replacedOrder: {
              uid: '0xaaa',
            },
          },
        },
      )
      results.push(data)
    }

    results.forEach((data) => {
      const parsedData = JSON.parse(data.fullAppData)
      expect(parsedData.environment).toBe('staging')
      expect(parsedData.metadata.partnerFee.volumeBps).toBe(66)
      expect(parsedData.metadata.partnerFee.recipient).toBe('0xccc')
      expect(parsedData.metadata.replacedOrder.uid).toBe('0xaaa')
    })
  })

  it('App data doc should be stringified in deterministic way', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const data1 = await generateAppDataFromDoc({ version: '1.0', appCode: 'code', metadata: {} })
      const data2 = await generateAppDataFromDoc({ appCode: 'code', metadata: {}, version: '1.0' })
      results.push({ data1, data2 })
    }

    results.forEach(({ data1, data2 }) => {
      expect(data1.fullAppData).toBe(data2.fullAppData)
    })
  })
})
