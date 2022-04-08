import fetch from 'jest-fetch-mock'
import { CowSdk } from '../../CowSdk'

const chainId = 4 //Rinkeby
const cowSdk = new CowSdk(chainId)

const HTTP_STATUS_OK = 200

const ORDER_RESPONSE = {
  sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  sellAmount: '1234567890',
  buyAmount: '1234567890',
  validTo: 0,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  feeAmount: '1234567890',
  kind: 'buy',
  partiallyFillable: true,
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
  signingScheme: 'eip712',
  signature:
    '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  from: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  creationTime: '2020-12-03T18:35:18.814523Z',
  owner: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  UID: 'string',
  availableBalance: '1234567890',
  executedSellAmount: '1234567890',
  executedSellAmountBeforeFees: '1234567890',
  executedBuyAmount: '1234567890',
  executedFeeAmount: '1234567890',
  invalidated: true,
  status: 'presignaturePending',
  fullFeeAmount: '1234567890',
}

beforeEach(() => {
  fetch.resetMocks()
})

test('Valid: get an order ', async () => {
  fetch.mockResponseOnce(
    JSON.stringify({
      ok: true,
      status: HTTP_STATUS_OK,
      json: () => ORDER_RESPONSE,
    })
  )
  const order = await cowSdk.cowApi.getOrder('string')
  console.log(order, 'order')
})
