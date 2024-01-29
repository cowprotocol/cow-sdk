import { gql } from 'graphql-request'
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { SupportedChainId } from '../common/chains'
import { CowError } from '../common/cow-error'
import { LAST_DAYS_VOLUME_QUERY, LAST_HOURS_VOLUME_QUERY, TOTALS_QUERY } from './queries'
import { SUBGRAPH_PROD_CONFIG, SubgraphApi } from './api'

enableFetchMocks()

const cowSubgraphApi = new SubgraphApi()
const prodUrls = SUBGRAPH_PROD_CONFIG

const headers = {
  'Content-Type': 'application/json',
}

const getFetchParameters = (query: string, operationName: string, variables?: unknown) => {
  const body = {
    query,
    variables,
    operationName,
  }

  return { body: JSON.stringify(body), headers, method: 'POST' }
}

const TOTALS_RESPONSE = {
  data: {
    totals: [
      {
        tokens: '192',
        orders: '365210',
        traders: '50731',
        settlements: '160092',
        volumeUsd: '49548634.23978489392550883815112596',
        volumeEth: '20349080.82753326160179174564685693',
        feesUsd: '1495.18088540037791409373835505834',
        feesEth: '632.7328748466552906975758491191759',
      },
    ],
  },
}

const LAST_7_DAYS_VOLUME_RESPONSE = {
  data: {
    dailyTotals: [
      {
        timestamp: '1651104000',
        volumeUsd: '32085.1639220805155999650325844739',
      },
      {
        timestamp: '1651017600',
        volumeUsd: '34693.62007717297749801092930059675',
      },
      {
        timestamp: '1650931200',
        volumeUsd: '33122.5365226034644783539316622137',
      },
      {
        timestamp: '1650844800',
        volumeUsd: '44339.87713137673812392999146686429',
      },
      {
        timestamp: '1650758400',
        volumeUsd: '33152.20678736108925012284114682263',
      },
      {
        timestamp: '1650672000',
        volumeUsd: '74499.81969341967474378140565634503',
      },
      {
        timestamp: '1650585600',
        volumeUsd: '55696.47839632449194353566942457261',
      },
    ],
  },
}

const LAST_24_HOURS_VOLUME_RESPONSE = {
  data: {
    hourlyTotals: [
      {
        timestamp: '1651186800',
        volumeUsd: '190.9404913756501392195019404899438',
      },
      {
        timestamp: '1651183200',
        volumeUsd: '529.9946238000561779423929757743504',
      },
      {
        timestamp: '1651179600',
        volumeUsd: '645.3587505699802324165958548720157',
      },
      {
        timestamp: '1651176000',
        volumeUsd: '1708.483608648853800630669110444808',
      },
      {
        timestamp: '1651172400',
        volumeUsd: '7121.457330823292680300996744986044',
      },
      {
        timestamp: '1651168800',
        volumeUsd: '1821.297602760111978245784985569166',
      },
      {
        timestamp: '1651165200',
        volumeUsd: '2785.484680212634326873580046251588',
      },
      {
        timestamp: '1651161600',
        volumeUsd: '1969.469152211506355791899301692229',
      },
      {
        timestamp: '1651158000',
        volumeUsd: '2162.897300873319012826008286358389',
      },
      {
        timestamp: '1651154400',
        volumeUsd: '1513.553639465779399627761684465762',
      },
      {
        timestamp: '1651150800',
        volumeUsd: '187.4730505008263524958136028913312',
      },
      {
        timestamp: '1651147200',
        volumeUsd: '1003.733903282400166632845200890861',
      },
      {
        timestamp: '1651143600',
        volumeUsd: '430.0861170487354094851133346726692',
      },
      {
        timestamp: '1651140000',
        volumeUsd: '332.7800791403069749429589009477125',
      },
      {
        timestamp: '1651136400',
        volumeUsd: '97.63235373438852625638744867165181',
      },
      {
        timestamp: '1651132800',
        volumeUsd: '30.59818396279718981525514608110329',
      },
      {
        timestamp: '1651129200',
        volumeUsd: '4891.57094852254524822966041865283',
      },
      {
        timestamp: '1651125600',
        volumeUsd: '0.2822502035827220060153182158280592',
      },
      {
        timestamp: '1651122000',
        volumeUsd: '2618.536314756480243120625177213215',
      },
      {
        timestamp: '1651118400',
        volumeUsd: '188.6060152287524476251961231904293',
      },
      {
        timestamp: '1651114800',
        volumeUsd: '1081.900497533608727191602938189487',
      },
      {
        timestamp: '1651111200',
        volumeUsd: '189.2511347347182236433877630220942',
      },
      {
        timestamp: '1651107600',
        volumeUsd: '443.7262478626930371100298278690119',
      },
      {
        timestamp: '1651104000',
        volumeUsd: '240.7104588694898118223893758683719',
      },
    ],
  },
}

const TOKENS_BY_VOLUME_RESPONSE = {
  data: {
    tokens: [
      {
        address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
        symbol: 'WXDAI',
        totalVolumeUsd: '32889034.621839712648167717',
        priceUsd: '1',
      },
      {
        address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
        symbol: 'USDC',
        totalVolumeUsd: '31296380.98818012532887553375630894',
        priceUsd: '0.9983008873217955125012875742815512',
      },
      {
        address: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
        symbol: 'WETH',
        totalVolumeUsd: '11313677.56406394346907690670613874',
        priceUsd: '2930.058705030603523831034274967579',
      },
      {
        address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
        symbol: 'USDT',
        totalVolumeUsd: '9390602.813697073697851431730404586',
        priceUsd: '1.00560814041993584287438922806966',
      },
      {
        address: '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
        symbol: 'GNO',
        totalVolumeUsd: '5667965.685777522243148118842046968',
        priceUsd: '327.4436350035803489070442497891915',
      },
    ],
  },
}

const INVALID_QUERY_RESPONSE = {
  errors: [
    {
      locations: [
        {
          line: 2,
          column: 9,
        },
      ],
      message: 'Type `Query` has no field `invalidQuery`',
    },
  ],
}

describe('CoW subgraph URL', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Valid: Get Totals', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(TOTALS_RESPONSE), {
      status: 200,
      headers,
    })
    const totals = await cowSubgraphApi.getTotals()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      prodUrls[SupportedChainId.MAINNET],
      getFetchParameters(TOTALS_QUERY, 'Totals')
    )
    expect(totals).toEqual(TOTALS_RESPONSE.data.totals[0])
  })

  test('Valid: Get Last 7 days volume', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(LAST_7_DAYS_VOLUME_RESPONSE), {
      status: 200,
      headers,
    })
    const response = await cowSubgraphApi.getLastDaysVolume(7)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      prodUrls[SupportedChainId.MAINNET],
      getFetchParameters(LAST_DAYS_VOLUME_QUERY, 'LastDaysVolume', { days: 7 })
    )
    expect(response).toEqual(LAST_7_DAYS_VOLUME_RESPONSE.data)
  })

  test('Valid: Get Last 24 hours volume', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(LAST_24_HOURS_VOLUME_RESPONSE), {
      status: 200,
      headers,
    })
    const response = await cowSubgraphApi.getLastHoursVolume(24)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      prodUrls[SupportedChainId.MAINNET],
      getFetchParameters(LAST_HOURS_VOLUME_QUERY, 'LastHoursVolume', { hours: 24 })
    )
    expect(response).toEqual(LAST_24_HOURS_VOLUME_RESPONSE.data)
  })

  test('Valid: Run custom query', async () => {
    const query = gql`
      query TokensByVolume {
        tokens(first: 5, orderBy: totalVolumeUsd, orderDirection: desc) {
          address
          symbol
          totalVolumeUsd
          priceUsd
        }
      }
    `
    fetchMock.mockResponseOnce(JSON.stringify(TOKENS_BY_VOLUME_RESPONSE), {
      status: 200,
      headers,
    })
    const response = await cowSubgraphApi.runQuery(query)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      prodUrls[SupportedChainId.MAINNET],
      getFetchParameters(query, 'TokensByVolume')
    )
    expect(response).toEqual(TOKENS_BY_VOLUME_RESPONSE.data)
  })

  test('Invalid: non-existent query', async () => {
    const query = gql`
      query InvalidQuery {
        invalidQuery {
          field1
          field2
        }
      }
    `
    fetchMock.mockResponseOnce(JSON.stringify(INVALID_QUERY_RESPONSE), {
      status: 200,
      headers,
    })
    await expect(cowSubgraphApi.runQuery(query)).rejects.toThrowError(CowError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      prodUrls[SupportedChainId.MAINNET],
      getFetchParameters(query, 'InvalidQuery')
    )
  })

  test('Uses urls from custom env config', async () => {
    const customEnvConfig = {
      [SupportedChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-staging',
      [SupportedChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc-staging',
      [SupportedChainId.SEPOLIA]: null,
    }

    const customSubgraphApi = new SubgraphApi({
      baseUrls: customEnvConfig,
    })

    fetchMock.mockResponseOnce(JSON.stringify(TOTALS_RESPONSE), {
      status: 200,
      headers,
    })
    const totals = await customSubgraphApi.getTotals()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      customEnvConfig[SupportedChainId.MAINNET],
      getFetchParameters(TOTALS_QUERY, 'Totals')
    )
    expect(totals).toEqual(TOTALS_RESPONSE.data.totals[0])
  })
})
