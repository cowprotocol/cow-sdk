import '../../order-book/__mock__/api'
import { GPv2Order } from '../generated/ComposableCoW'
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
const SALT = '0xd98a87ed4e45bfeae3f779e1ac09ceacdfb57da214c7fffa6434aeb969f396c0'
const SALT_2 = '0xd98a87ed4e45bfeae3f779e1ac09ceacdfb57da214c7fffa6434aeb969f396c1'
const TWAP_ID = '0xd8a6889486a47d8ca8f4189f11573b39dbc04f605719ebf4050e44ae53c1bedf'
const TWAP_ID_2 = '0x8ddb7e8e1cd6a06d5bb6f91af21a2b26a433a5d8402ccddb00a72e4006c46994'

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

describe('Id', () => {
  test('Id is computed correctly', () => {
    const twap = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT)
    expect(twap.id).toEqual(TWAP_ID)
  })

  test("Id doesn't change for the same params and salt", () => {
    const twap1 = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT)
    const twap2 = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT)

    expect(twap1.id).toEqual(twap2.id)
  })

  test('Id changes for same params and different salt', () => {
    const twap1 = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT)
    const twap2 = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT_2)

    expect(twap1.id).not.toEqual(twap2.id)
    expect(twap2.id).toEqual(TWAP_ID_2)
  })

  test('Id changes for different params and same salt', () => {
    const twap = Twap.fromData(
      { ...TWAP_PARAMS_TEST, startTime: { startType: StartTimeValue.AT_EPOCH, epoch: BigNumber.from(123456789) } },
      SALT
    )

    expect(twap.id).toEqual('0xe993544057dbc8504c4e38a6fe35845a81e0849c11242a6070f9d25152598df6')
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
  test('toString: Default', () => {
    const twap = Twap.fromData(TWAP_PARAMS_TEST, SALT)
    expect(twap.toString()).toEqual(
      'twap (0xd8a6889486a47d8ca8f4189f11573b39dbc04f605719ebf4050e44ae53c1bedf): {"sellAmount":"1000000000000000000","sellToken":"0x6810e776880C02933D47DB1b9fc05908e5386b96","buyAmount":"1000000000000000000","buyToken":"0xDAE5F1590db13E3B40423B5b5c5fbf175515910b","numberOfParts":"10","startTime":"AT_MINING_TIME","timeBetweenParts":3600,"durationOfPart":"AUTO","receiver":"0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF","appData":"0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5"}'
    )
  })
  test('toString: start time at epoch', () => {
    const twap = Twap.fromData(
      {
        ...TWAP_PARAMS_TEST,
        startTime: {
          startType: StartTimeValue.AT_EPOCH,
          epoch: BigNumber.from(1692876646),
        },
      },
      SALT
    )
    expect(twap.toString()).toEqual(
      'twap (0x28b19554c54f10b67f6ef7e72bdc552fb865b12d33b797ac51227768705fff0d): {"sellAmount":"1000000000000000000","sellToken":"0x6810e776880C02933D47DB1b9fc05908e5386b96","buyAmount":"1000000000000000000","buyToken":"0xDAE5F1590db13E3B40423B5b5c5fbf175515910b","numberOfParts":"10","startTime":1692876646,"timeBetweenParts":3600,"durationOfPart":"AUTO","receiver":"0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF","appData":"0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5"}'
    )
  })

  test('toString: limit duration', () => {
    const twap = Twap.fromData(
      {
        ...TWAP_PARAMS_TEST,
        durationOfPart: {
          durationType: DurationType.LIMIT_DURATION,
          duration: BigNumber.from(1000),
        },
      },
      SALT
    )
    expect(twap.toString()).toEqual(
      'twap (0x7352e87b6e5d7c4e27479a13b7ba8bc0d67a947d1692994bd995c9dcc94c166a): {"sellAmount":"1000000000000000000","sellToken":"0x6810e776880C02933D47DB1b9fc05908e5386b96","buyAmount":"1000000000000000000","buyToken":"0xDAE5F1590db13E3B40423B5b5c5fbf175515910b","numberOfParts":"10","startTime":"AT_MINING_TIME","timeBetweenParts":3600,"durationOfPart":1000,"receiver":"0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF","appData":"0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5"}'
    )
  })
})

describe('Poll Validate', () => {
  const blockNumber = 123456
  const blockTimestamp = 1700000000
  const mockCabinet: jest.MockedFunction<(params: OwnerContext) => Promise<string>> = jest.fn()
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
    // Just make pollValidate public so we can call it in isolation
    public pollValidate(params): Promise<PollResultErrors | undefined> {
      return super.pollValidate(params)
    }

    cabinet = mockCabinet
    endTimestamp = mockEndTimestamp
  }
  const twap = new MockTwap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test(`Open TWAP, passes the validations`, async () => {
    // GIVEN: A TWAP that should be active (should start 1 second ago, should finish in 1 second)
    mockCabinet.mockReturnValue(uint256Helper(blockTimestamp - 1))
    mockEndTimestamp.mockReturnValue(blockTimestamp + 1)

    // WHEN: We poll
    const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })

    // THEN: The start time and end time of the TWAP will be checked
    expect(mockCabinet).toBeCalledTimes(1)

    // THEN: Successful validation
    expect(result).toEqual(undefined)
  })

  test(`[TRY_AT_EPOCH] TWAP has not started`, async () => {
    // GIVEN: A TWAP that hasn't started (should start in 1 second, should finish in 2 second)
    const startTime = blockTimestamp + 1
    mockCabinet.mockReturnValue(uint256Helper(startTime))
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
    mockCabinet.mockReturnValue(uint256Helper(blockTimestamp - 2))
    mockEndTimestamp.mockReturnValue(expireTime)

    // WHEN: We poll
    const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })

    // THEN: Then, it will return an error instructing to not try again (expired order is a final state, so there's no point to keep polling)
    expect(result).toEqual({
      result: PollResultCode.DONT_TRY_AGAIN,
      reason: 'TWAP has expired. Expired at 1699999999 (2023-11-14T22:13:19.000Z)',
    })
  })

  test(`[CABINET OVERFLOW] The cabinet stored value is greater than uint32`, async () => {
    // GIVEN: The cabinet stored value is greater than uint32
    mockCabinet.mockReturnValue(uint256Helper(2 ** 32))

    // WHEN: We poll
    const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })

    // THEN: Then, it will return an error instructing to not try again (expired order is a final state, so there's no point to keep polling)
    expect(result).toEqual({
      result: PollResultCode.DONT_TRY_AGAIN,
      reason: 'Cabinet epoch out of range: 4294967296',
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
    mockCabinet.mockReturnValue(uint256Helper(startTime))
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

describe('Current TWAP part is in the Order Book', () => {
  const blockNumber = 123456
  const startTimestamp = 1700000000
  const timeBetweenParts = 100
  const numberOfParts = 10
  const totalDuration = timeBetweenParts * numberOfParts
  const orderId = '0x1'
  const order = {} as GPv2Order.DataStruct

  const getPollParams = ({ blockTimestamp }: { blockTimestamp: number }) =>
    ({
      owner: OWNER,
      chainId: 1,
      provider: {},
      blockInfo: {
        blockNumber,
        blockTimestamp,
      },
    } as PollParams)

  class MockTwap extends Twap {
    // Just make handlePollFailedAlreadyPresent public so we can call it in isolation
    public handlePollFailedAlreadyPresent(orderId, order, params): Promise<PollResultErrors | undefined> {
      return super.handlePollFailedAlreadyPresent(orderId, order, params)
    }
  }

  const twap = new MockTwap({
    handler: TWAP_ADDRESS,
    data: {
      ...TWAP_PARAMS_TEST,
      timeBetweenParts: BigNumber.from(100),
      numberOfParts: BigNumber.from(10),
      startTime: {
        startType: StartTimeValue.AT_EPOCH,
        epoch: BigNumber.from(startTimestamp),
      },
    },
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test(`Polling at the start of part 1/10`, async () => {
    // GIVEN: The order starts precisely at the current block time
    const pollParams = getPollParams({
      blockTimestamp: startTimestamp,
    })

    // WHEN: We invoke handlePollFailedAlreadyPresent
    const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)

    // THEN: It should instruct we should wait for part 2 to start
    expect(result).toEqual({
      result: PollResultCode.TRY_AT_EPOCH,
      reason:
        "Current active TWAP part (1/10) is already in the Order Book. TWAP part 2 doesn't start until 1700000100 (2023-11-14T22:15:00.000Z)",
      epoch: 1700000100,
    })
  })

  test(`Polling at the middle of part 1/10`, async () => {
    // GIVEN: Polling at the middle of the first part
    const pollParams = getPollParams({
      blockTimestamp: startTimestamp + Math.floor(timeBetweenParts / 2),
    })

    // WHEN: We invoke handlePollFailedAlreadyPresent
    const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)

    // THEN: It should instruct we should wait for part 2 to start
    expect(result).toEqual({
      result: PollResultCode.TRY_AT_EPOCH,
      reason:
        "Current active TWAP part (1/10) is already in the Order Book. TWAP part 2 doesn't start until 1700000100 (2023-11-14T22:15:00.000Z)",
      epoch: 1700000100,
    })
  })

  test(`Polling at the last second of part 1/10`, async () => {
    // GIVEN: Polling at the last second of the first part
    const pollParams = getPollParams({
      blockTimestamp: startTimestamp + timeBetweenParts - 1,
    })

    // WHEN: We invoke handlePollFailedAlreadyPresent
    const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)

    // THEN: It should instruct we should wait for part 2 to start
    expect(result).toEqual({
      result: PollResultCode.TRY_AT_EPOCH,
      reason:
        "Current active TWAP part (1/10) is already in the Order Book. TWAP part 2 doesn't start until 1700000100 (2023-11-14T22:15:00.000Z)",
      epoch: 1700000100,
    })
  })

  test(`Polling at the start of part 2/10`, async () => {
    // GIVEN: Part 2 just started
    const pollParams = getPollParams({
      blockTimestamp: startTimestamp + timeBetweenParts,
    })

    // WHEN: We invoke handlePollFailedAlreadyPresent
    const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)

    // THEN: It should instruct we should wait for part 3 to start
    expect(result).toEqual({
      result: PollResultCode.TRY_AT_EPOCH,
      reason:
        "Current active TWAP part (2/10) is already in the Order Book. TWAP part 3 doesn't start until 1700000200 (2023-11-14T22:16:40.000Z)",
      epoch: 1700000200,
    })
  })

  test(`Polling at the last second of part 9/10`, async () => {
    // GIVEN: Part 9 is about to end
    const pollParams = getPollParams({
      blockTimestamp: startTimestamp + 9 * timeBetweenParts - 1,
    })

    // WHEN: We invoke handlePollFailedAlreadyPresent
    const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)

    // THEN: It should instruct we should wait for part 10 to start
    expect(result).toEqual({
      result: PollResultCode.TRY_AT_EPOCH,
      reason:
        "Current active TWAP part (9/10) is already in the Order Book. TWAP part 10 doesn't start until 1700000900 (2023-11-14T22:28:20.000Z)",
      epoch: 1700000900,
    })
  })

  test(`Polling at the first second of part 10/10`, async () => {
    // GIVEN: Part 10 has just started
    const pollParams = getPollParams({
      blockTimestamp: startTimestamp + 9 * timeBetweenParts,
    })

    // WHEN: We invoke handlePollFailedAlreadyPresent
    const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)

    // THEN: It should instruct that this was the last TWAP part.
    expect(result).toEqual({
      result: PollResultCode.DONT_TRY_AGAIN,
      reason:
        'Current active TWAP part (10/10) is already in the Order Book. This was the last TWAP part, no more orders need to be placed',
    })
  })

  test(`[UNEXPECTED_ERROR] Twap hasn't started`, async () => {
    // GIVEN: The order hasn't started (starts 1 second after this block)
    const pollParams = getPollParams({
      blockTimestamp: startTimestamp - 1,
    })

    // WHEN: We invoke handlePollFailedAlreadyPresent
    const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)

    // THEN: It should raise an Unhandled error (it should never happen). This function should be invoked only if "pollValidate" who should already make sure the polling fails if it hasn't started the TWAP
    expect(result).toEqual({
      result: PollResultCode.UNEXPECTED_ERROR,
      reason: "TWAP part hash't started. First TWAP part start at 1700000000 (2023-11-14T22:13:20.000Z)",
      error: undefined,
    })
  })

  test(`[UNEXPECTED_ERROR] Twap has expired`, async () => {
    // GIVEN: The order has expired
    const pollParams = getPollParams({
      blockTimestamp: startTimestamp + totalDuration + 1,
    })

    // WHEN: We invoke handlePollFailedAlreadyPresent
    const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)

    // THEN: It should raise an Unhandled error (it should never happen). This function should be invoked only if "pollValidate" who should already make sure the polling fails if it is expired
    expect(result).toEqual({
      result: PollResultCode.UNEXPECTED_ERROR,
      reason: 'TWAP is expired. Expired at 1700001000 (2023-11-14T22:30:00.000Z)',
      error: undefined,
    })
  })
})

const uint256Helper = (n: number) => Promise.resolve(utils.defaultAbiCoder.encode(['uint256'], [n]))
