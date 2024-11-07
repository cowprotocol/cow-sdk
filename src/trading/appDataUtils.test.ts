import { buildAppData, generateAppDataFromDoc } from './appDataUtils'

describe('AppData utils', () => {
  it('Should add all required parameters to the doc', async () => {
    const data = await buildAppData({
      slippageBps: 100,
      appCode: 'cowswap',
      orderClass: 'market',
    })
    const parsedData = JSON.parse(data.fullAppData)

    expect(parsedData.metadata.quote.slippageBips).toBe(100)
    expect(parsedData.appCode).toBe('cowswap')
    expect(parsedData.metadata.orderClass.orderClass).toBe('market')
  })

  it('Should add advanced parameters to the doc', async () => {
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
            bps: 66,
            recipient: '0xccc',
          },
          replacedOrder: {
            uid: '0xaaa',
          },
        },
      }
    )
    const parsedData = JSON.parse(data.fullAppData)

    expect(parsedData.environment).toBe('staging')
    expect(parsedData.metadata.partnerFee.bps).toBe(66)
    expect(parsedData.metadata.partnerFee.recipient).toBe('0xccc')
    expect(parsedData.metadata.replacedOrder.uid).toBe('0xaaa')
  })

  it('App data doc should be stringified in deterministic way', async () => {
    const data1 = await generateAppDataFromDoc({ version: '1.0', appCode: 'code', metadata: {} })
    const data2 = await generateAppDataFromDoc({ appCode: 'code', metadata: {}, version: '1.0' })

    expect(data1.fullAppData).toBe(data2.fullAppData)
  })
})
