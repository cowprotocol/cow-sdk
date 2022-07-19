import { OrderKind } from '@cowprotocol/contracts'
import { getCanonicalMarket, getTokensFromMarket } from './market'

test('Get correct canonical market from tokens: SELL', async () => {
  const sellToken = '0xSELL_TOKEN',
    buyToken = '0xBUY_TOKEN',
    kind = OrderKind.SELL
  const market = getCanonicalMarket({ sellToken, buyToken, kind })

  expect(market).toEqual({ baseToken: '0xSELL_TOKEN', quoteToken: '0xBUY_TOKEN' })
})

test('Get correct canonical market from tokens: BUY', async () => {
  const sellToken = '0xSELL_TOKEN',
    buyToken = '0xBUY_TOKEN',
    kind = OrderKind.BUY
  const market = getCanonicalMarket({ sellToken, buyToken, kind })

  expect(market).toEqual({ baseToken: '0xBUY_TOKEN', quoteToken: '0xSELL_TOKEN' })
})

test('Get correct tokens from market: SELL', async () => {
  const baseToken = '0xBASE_TOKEN',
    quoteToken = '0xQUOTE_TOKEN',
    kind = OrderKind.SELL

  const tokens = getTokensFromMarket({ quoteToken, baseToken, kind })
  expect(tokens).toEqual({ sellToken: '0xBASE_TOKEN', buyToken: '0xQUOTE_TOKEN' })
})

test('Get correct tokens from market: BUY', async () => {
  const baseToken = '0xBASE_TOKEN',
    quoteToken = '0xQUOTE_TOKEN',
    kind = OrderKind.BUY

  const tokens = getTokensFromMarket({ quoteToken, baseToken, kind })
  expect(tokens).toEqual({ sellToken: '0xQUOTE_TOKEN', buyToken: '0xBASE_TOKEN' })
})
