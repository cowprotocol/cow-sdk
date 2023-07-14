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

import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { TWAP, type TWAPDataParams } from './twap'
import { BigNumber, utils, constants } from 'ethers'

enableFetchMocks()

export const TWAP_PARAMS_TEST: TWAPDataParams = {
  sellToken: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
  buyToken: '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b',
  sellAmount: utils.parseEther('1'),
  buyAmount: utils.parseEther('1'),
  t: BigNumber.from(60 * 60),
  n: BigNumber.from(10),
  receiver: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
  span: BigNumber.from(0),
  t0: BigNumber.from(0),
  appData: '0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5',
}

const TWAP_SERIALIZED = (salt?: string): string => {
  return (
    '0x' +
    '0000000000000000000000000000000000000000000000000000000000000020' +
    '000000000000000000000000910d00a310f7dc5b29fe73458f47f519be547d3d' +
    (salt?.substring(2) ?? '9379a0bf532ff9a66ffde940f94b1a025d6f18803054c1aef52dc94b15255bbe') +
    '0000000000000000000000000000000000000000000000000000000000000060' +
    '0000000000000000000000000000000000000000000000000000000000000140' +
    '0000000000000000000000006810e776880c02933d47db1b9fc05908e5386b96' +
    '000000000000000000000000dae5f1590db13e3b40423b5b5c5fbf175515910b' +
    '000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef' +
    '000000000000000000000000000000000000000000000000016345785d8a0000' +
    '000000000000000000000000000000000000000000000000016345785d8a0000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '000000000000000000000000000000000000000000000000000000000000000a' +
    '0000000000000000000000000000000000000000000000000000000000000e10' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    'd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5'
  )
}

describe('TWAP', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Create: constructor creates valid TWAP', () => {
    const twap = TWAP.default(TWAP_PARAMS_TEST)
    expect(twap.orderType).toEqual('TWAP')
    expect(twap.hasOffChainInput).toEqual(false)
    expect(twap.offChainInput).toEqual('0x')
    expect(twap.context?.address).not.toBeUndefined()

    const twap2 = TWAP.default({ ...TWAP_PARAMS_TEST, t0: BigNumber.from(1) })
    expect(twap2.context).toBeUndefined()
  })

  test('isValid: Validates TWAP params', () => {
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST })).not.toThrow()
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, sellToken: TWAP_PARAMS_TEST.buyToken })).toThrow('InvalidSameToken')
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, sellToken: constants.AddressZero })).toThrow('InvalidToken')
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, buyToken: constants.AddressZero })).toThrow('InvalidToken')
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, sellAmount: BigNumber.from(0) })).toThrow('InvalidSellAmount')
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, buyAmount: BigNumber.from(0) })).toThrow('InvalidMinBuyAmount')
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, t0: BigNumber.from(-1) })).toThrow('InvalidStartTime')
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, n: BigNumber.from(0) })).toThrow('InvalidNumParts')
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, t: BigNumber.from(0) })).toThrow('InvalidFrequency')
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, span: TWAP_PARAMS_TEST.t.add(1) })).toThrow('InvalidSpan')
  })

  test('isValidAbi: Fails if invalid', () => {
    // The below test triggers a throw by trying to ABI parse `appData` as a `bytes32` when
    // it only has 20 bytes (ie. an address)
    expect(() => TWAP.default({ ...TWAP_PARAMS_TEST, appData: constants.AddressZero })).toThrow('InvalidData')
  })

  test('serialize: Serializes correctly', () => {
    const twap = TWAP.default(TWAP_PARAMS_TEST)
    expect(twap.serialize()).toEqual(TWAP_SERIALIZED(twap.salt))
  })

  test('deserialize: Deserializes correctly', () => {
    const twap = TWAP.default(TWAP_PARAMS_TEST)
    expect(TWAP.deserialize(TWAP_SERIALIZED(twap.salt))).toMatchObject(twap)
  })

  test('deserialize: Throws if invalid', () => {
    expect(() => TWAP.deserialize('0x')).toThrow('InvalidSerializedConditionalOrder')
  })

  test('toString: Formats correctly', () => {
    expect(TWAP.default(TWAP_PARAMS_TEST).toString()).toEqual(
      `TWAP: Sell total ${TWAP_PARAMS_TEST.sellToken}@${TWAP_PARAMS_TEST.sellAmount} for a minimum of ${TWAP_PARAMS_TEST.buyToken}@${TWAP_PARAMS_TEST.buyAmount} over ${TWAP_PARAMS_TEST.n} parts with a spacing of ${TWAP_PARAMS_TEST.t}s beginning at time of mining`
    )
    const t0 = BigNumber.from(BigInt(Date.now()) / 1000n)
    expect(TWAP.default({ ...TWAP_PARAMS_TEST, t0 }).toString()).toEqual(
      `TWAP: Sell total ${TWAP_PARAMS_TEST.sellToken}@${TWAP_PARAMS_TEST.sellAmount} for a minimum of ${
        TWAP_PARAMS_TEST.buyToken
      }@${TWAP_PARAMS_TEST.buyAmount} over ${TWAP_PARAMS_TEST.n} parts with a spacing of ${
        TWAP_PARAMS_TEST.t
      }s beginning at ${new Date(Number(t0) * 1000)}`
    )
  })
})
