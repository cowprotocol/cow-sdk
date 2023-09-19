import '../../order-book/__mock__/api'
import { OwnerContext, PollParams, PollResultCode, PollResultErrors } from '../types'
import { DurationType, StartTimeValue, Twap, TWAP_ADDRESS, TwapData } from './Twap'
import { BigNumber, utils, constants, providers } from 'ethers'

const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
export const TWAP_PARAMS_TEST: TwapData = {
  sellToken: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
  buyToken: '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b',
  receiver: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
  sellAmount: utils.parseEther('1'),
  buyAmount: utils.parseEther('1'),
  timeBetweenParts: BigNumber.from(60 * 60),
  numberOfParts: BigNumber.from(10),
  durationOfPart: {
    durationType: DurationType.AUTO,
  },
  startTime: {
    startType: StartTimeValue.AT_MINING_TIME,
  },
  appData: '0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5',
}

export const TWAP_SERIALIZED = (salt?: string): string => {
  return (
    '0x' +
    '0000000000000000000000000000000000000000000000000000000000000020' +
    '000000000000000000000000' +
    TWAP_ADDRESS.substring(2).toLowerCase() +
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

export function generateRandomTWAPData(): TwapData {
  return {
    sellToken: utils.getAddress(utils.hexlify(utils.randomBytes(20))),
    buyToken: utils.getAddress(utils.hexlify(utils.randomBytes(20))),
    receiver: constants.AddressZero,
    sellAmount: utils.parseEther('1'),
    buyAmount: utils.parseEther('1'),
    timeBetweenParts: BigNumber.from(60 * 60),
    numberOfParts: BigNumber.from(10),
    durationOfPart: {
      durationType: DurationType.AUTO,
    },
    startTime: {
      startType: StartTimeValue.AT_MINING_TIME,
    },
    appData: utils.hexlify(utils.randomBytes(32)),
  }
}

describe('Constructor', () => {
  test('Create new valid TWAP', () => {
    const twap = new Twap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })
    expect(twap.orderType).toEqual('twap')
    expect(twap.hasOffChainInput).toEqual(false)
    expect(twap.offChainInput).toEqual('0x')
    expect(twap.context?.address).not.toBeUndefined()
  })

  test('Create Twap with invalid handler', () => {
    expect(() => new Twap({ handler: '0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddead', data: TWAP_PARAMS_TEST })).toThrow(
      'InvalidHandler'
    )
  })
})

describe('Twap.fromData', () => {
  test('Creates valid TWAP: Start at mining time', () => {
    const twap = Twap.fromData(TWAP_PARAMS_TEST)
    expect(twap.orderType).toEqual('twap')
    expect(twap.hasOffChainInput).toEqual(false)
    expect(twap.offChainInput).toEqual('0x')
    expect(twap.context?.address).not.toBeUndefined()
  })

  test('Creates valid TWAP: Start at epoch', () => {
    const twap = Twap.fromData({
      ...TWAP_PARAMS_TEST,
      startTime: { startType: StartTimeValue.AT_EPOCH, epoch: BigNumber.from(1) },
    })
    expect(twap.context).toBeUndefined()
  })
})

describe('Validate', () => {
  test('Valid twap', () => {
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST }).isValid()).toEqual({ isValid: true })
  })

  test('Invalid twap: InvalidSameToken', () => {
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST, sellToken: TWAP_PARAMS_TEST.buyToken }).isValid()).toEqual({
      isValid: false,
      reason: 'InvalidSameToken',
    })
  })

  test('Invalid twap: InvalidToken (sell)', () => {
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST, sellToken: constants.AddressZero }).isValid()).toEqual({
      isValid: false,
      reason: 'InvalidToken',
    })
  })

  test('Invalid twap: InvalidToken (buy)', () => {
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST, buyToken: constants.AddressZero }).isValid()).toEqual({
      isValid: false,
      reason: 'InvalidToken',
    })
  })

  test('Invalid twap: InvalidSellAmount', () => {
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST, sellAmount: BigNumber.from(0) }).isValid()).toEqual({
      isValid: false,
      reason: 'InvalidSellAmount',
    })
  })

  test('Invalid twap: InvalidMinBuyAmount', () => {
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST, buyAmount: BigNumber.from(0) }).isValid()).toEqual({
      isValid: false,
      reason: 'InvalidMinBuyAmount',
    })
  })

  test('Invalid twap: InvalidStartTime', () => {
    expect(
      Twap.fromData({
        ...TWAP_PARAMS_TEST,
        startTime: { startType: StartTimeValue.AT_EPOCH, epoch: BigNumber.from(-1) },
      }).isValid()
    ).toEqual({
      isValid: false,
      reason: 'InvalidStartTime',
    })
  })

  test('Invalid twap: InvalidNumParts', () => {
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST, numberOfParts: BigNumber.from(0) }).isValid()).toEqual({
      isValid: false,
      reason: 'InvalidNumParts',
    })
  })

  test('Invalid twap: InvalidFrequency', () => {
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST, timeBetweenParts: BigNumber.from(0) }).isValid()).toEqual({
      isValid: false,
      reason: 'InvalidFrequency',
    })
  })

  test('Invalid twap: InvalidSpan (limit duration)', () => {
    expect(
      Twap.fromData({
        ...TWAP_PARAMS_TEST,
        durationOfPart: {
          durationType: DurationType.LIMIT_DURATION,
          duration: TWAP_PARAMS_TEST.timeBetweenParts.add(1),
        },
      }).isValid()
    ).toEqual({
      isValid: false,
      reason: 'InvalidSpan',
    })
  })

  test('Invalid twap: InvalidData (ABI parse error in appData)', () => {
    // The isValid below test triggers a throw by trying to ABI parse `appData` as a `bytes32` when
    // it only has 20 bytes (ie. an address)
    expect(Twap.fromData({ ...TWAP_PARAMS_TEST, appData: constants.AddressZero }).isValid()).toEqual({
      isValid: false,
      reason: 'InvalidData',
    })
  })
})

describe('Serialize', () => {
  test('serialize: Serializes correctly', () => {
    const twap = Twap.fromData(TWAP_PARAMS_TEST)
    expect(twap.serialize()).toEqual(TWAP_SERIALIZED(twap.salt))
  })
})

describe('Deserialize', () => {
  test('Deserializes correctly', () => {
    const twap = Twap.fromData(TWAP_PARAMS_TEST)
    expect(Twap.deserialize(TWAP_SERIALIZED(twap.salt))).toMatchObject(twap)
  })

  test('Throws if invalid', () => {
    expect(() => Twap.deserialize('0x')).toThrow('InvalidSerializedConditionalOrder')
  })
})

describe('To String', () => {
  test('toString: Formats correctly', () => {
    expect(Twap.fromData(TWAP_PARAMS_TEST).toString()).toEqual(
      'twap: Sell total 0x6810e776880C02933D47DB1b9fc05908e5386b96@1000000000000000000 for a minimum of 0xDAE5F1590db13E3B40423B5b5c5fbf175515910b@1000000000000000000 over 10 parts with a spacing of 3600s beginning at time of mining'
    )
    const startEpoch = BigNumber.from(1692876646)
    expect(
      Twap.fromData({
        ...TWAP_PARAMS_TEST,
        startTime: { startType: StartTimeValue.AT_EPOCH, epoch: startEpoch },
      }).toString()
    ).toEqual(
      'twap: Sell total 0x6810e776880C02933D47DB1b9fc05908e5386b96@1000000000000000000 for a minimum of 0xDAE5F1590db13E3B40423B5b5c5fbf175515910b@1000000000000000000 over 10 parts with a spacing of 3600s beginning at epoch 1692876646'
    )
  })
})

describe('Poll Validate', () => {
  const blockNumber = 123456
  const blockTimestamp = 1700000000
  const mockStartTimestamp: jest.MockedFunction<(params: OwnerContext) => Promise<number>> = jest.fn()
  const mockEndTimestamp: jest.MockedFunction<(startTimestamp: number) => number> = jest.fn()
  const mockGetBlock: jest.MockedFunction<
    (
      blockHashOrBlockTag: providers.BlockTag | string | Promise<providers.BlockTag | string>
    ) => Promise<providers.Block>
  > = jest.fn()

  const provider = {
    getBlock: mockGetBlock,
  } as unknown as providers.Provider

  const pollParams = {
    owner: OWNER,
    chainId: 1,
    provider,
  } as PollParams

  class MockTwap extends Twap {
    // Just make pollValidate so we can call it in isolation
    public pollValidate(params: PollParams): Promise<PollResultErrors | undefined> {
      return super.pollValidate(params)
    }

    startTimestamp = mockStartTimestamp
    endTimestamp = mockEndTimestamp
  }
  const twap = new MockTwap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test(`Open TWAP, passes the validations`, async () => {
    // GIVEN: A TWAP that should be active (should start 1 second ago, should finish in 1 second)
    mockStartTimestamp.mockReturnValue(Promise.resolve(blockTimestamp - 1))
    mockEndTimestamp.mockReturnValue(blockTimestamp + 1)

    // WHEN: We poll
    const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })

    // THEN: The start time and end time of the TWAP will be checked
    expect(mockStartTimestamp).toBeCalledTimes(1)
    expect(mockEndTimestamp).toBeCalledTimes(1)

    // THEN: Successful validation
    expect(result).toEqual(undefined)
  })

  test(`[TRY_AT_EPOCH] TWAP has not started`, async () => {
    // GIVEN: A TWAP that hasn't started (should start in 1 second, should finish in 2 second)
    const startTime = blockTimestamp + 1
    mockStartTimestamp.mockReturnValue(Promise.resolve(startTime))
    mockEndTimestamp.mockReturnValue(blockTimestamp + 2)

    // WHEN: We poll
    const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })

    // THEN: Then, it will return an error instructing to try in 1 second (at start time)
    expect(result).toEqual({
      result: PollResultCode.TRY_AT_EPOCH,
      epoch: startTime,
      reason: "TWAP hasn't started yet. Starts at 1700000001 (2023-11-14T22:13:21.000Z)",
    })
  })

  test(`[TRY_AT_EPOCH] TWAP has expired`, async () => {
    // GIVEN: A TWAP that has already expired (started 2 seconds ago, finished 1 second ago)
    const expireTime = blockTimestamp - 1
    mockStartTimestamp.mockReturnValue(Promise.resolve(blockTimestamp - 2))
    mockEndTimestamp.mockReturnValue(expireTime)

    // WHEN: We poll
    const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })

    // THEN: Then, it will return an error instructing to not try again (expired order is a final state, so there's no point to keep polling)
    expect(result).toEqual({
      result: PollResultCode.DONT_TRY_AGAIN,
      reason: 'TWAP has expired. Expired at 1699999999 (2023-11-14T22:13:19.000Z)',
    })
  })

  test(`If there's no blockInfo, it will fetch the latest block`, async () => {
    // GIVEN: We don't provide the blockInfo with the poll params
    const blockInfo = undefined

    // GIVEN: The current block is before the start time
    mockGetBlock.mockReturnValue(
      Promise.resolve({
        number: blockNumber,
        timestamp: blockTimestamp,
      } as providers.Block)
    )
    const startTime = blockTimestamp + 1
    mockStartTimestamp.mockReturnValue(Promise.resolve(startTime))
    mockEndTimestamp.mockReturnValue(blockTimestamp + 2)

    // WHEN: We poll
    const result = await twap.pollValidate({ ...pollParams, blockInfo })

    // THEN: Then, we can see that it uses the right block timestamp to validate the order
    expect(result).toEqual({
      result: PollResultCode.TRY_AT_EPOCH,
      epoch: startTime,
      reason: "TWAP hasn't started yet. Starts at 1700000001 (2023-11-14T22:13:21.000Z)",
    })
  })
})
