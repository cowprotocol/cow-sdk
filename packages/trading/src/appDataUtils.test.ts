import { buildAppData, generateAppDataFromDoc, getDefaultUtmParams } from './appDataUtils'
import { createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import sdkPackageJson from '../../sdk/package.json'

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

  describe('UTM Tracking', () => {
    it('Should add default UTM parameters automatically', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const data = await buildAppData({
          slippageBps: 100,
          appCode: 'testapp',
          orderClass: 'market',
        })
        results.push(data)
      }

      results.forEach((data) => {
        const parsedData = JSON.parse(data.fullAppData)
        expect(parsedData.metadata.utm).toBeDefined()
        expect(parsedData.metadata.utm.utmSource).toBe('cowmunity')
        expect(parsedData.metadata.utm.utmMedium).toBe(`cow-sdk@${sdkPackageJson.version}`)
        expect(parsedData.metadata.utm.utmCampaign).toBe('developer-cohort')
        expect(parsedData.metadata.utm.utmContent).toBe('')
        expect(parsedData.metadata.utm.utmTerm).toBe('js')
      })
    })

    it('Should NOT add default UTM when user provides custom UTM parameters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const data = await buildAppData(
          {
            slippageBps: 100,
            appCode: 'testapp',
            orderClass: 'market',
          },
          {
            metadata: {
              utm: {
                utmSource: 'my-custom-source',
                utmContent: 'my-custom-content',
              },
            },
          },
        )
        results.push(data)
      }

      results.forEach((data) => {
        const parsedData = JSON.parse(data.fullAppData)
        expect(parsedData.metadata.utm).toBeDefined()
        // User's custom UTM should be preserved exactly as provided
        expect(parsedData.metadata.utm.utmSource).toBe('my-custom-source')
        expect(parsedData.metadata.utm.utmContent).toBe('my-custom-content')
        // SDK should NOT add default values for other fields when user provides UTM
        expect(parsedData.metadata.utm.utmMedium).toBeUndefined()
        expect(parsedData.metadata.utm.utmCampaign).toBeUndefined()
        expect(parsedData.metadata.utm.utmTerm).toBeUndefined()
      })
    })

    it('Should merge UTM with other metadata fields correctly', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const data = await buildAppData(
          {
            slippageBps: 200,
            appCode: 'testapp',
            orderClass: 'limit',
            partnerFee: {
              volumeBps: 100,
              recipient: '0xabc',
            },
          },
          {
            metadata: {
              hooks: {
                pre: ['0xhook1'],
              },
            },
          },
        )
        results.push(data)
      }

      results.forEach((data) => {
        const parsedData = JSON.parse(data.fullAppData)
        // UTM should be added alongside other metadata
        expect(parsedData.metadata.utm).toBeDefined()
        expect(parsedData.metadata.utm.utmSource).toBe('cowmunity')
        // Other metadata should be preserved
        expect(parsedData.metadata.quote.slippageBips).toBe(200)
        expect(parsedData.metadata.orderClass.orderClass).toBe('limit')
        expect(parsedData.metadata.partnerFee.volumeBps).toBe(100)
        expect(parsedData.metadata.hooks.pre).toEqual(['0xhook1'])
      })
    })

    it('getDefaultUtmParams should return correct default values', () => {
      const defaultUtm = getDefaultUtmParams()
      expect(defaultUtm.utmSource).toBe('cowmunity')
      expect(defaultUtm.utmMedium).toBe(`cow-sdk@${sdkPackageJson.version}`)
      expect(defaultUtm.utmCampaign).toBe('developer-cohort')
      expect(defaultUtm.utmContent).toBe('')
      expect(defaultUtm.utmTerm).toBe('js')
    })
  })
})
