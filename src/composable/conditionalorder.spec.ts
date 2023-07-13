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
import { BigNumber } from 'ethers'
import { BaseConditionalOrder } from './conditionalorder'
import { TWAP } from './types/twap'

enableFetchMocks()

const TWAP_SERIALIZED = (salt?: string, handler?: string): string => {
  return (
    '0x' +
    '0000000000000000000000000000000000000000000000000000000000000020' +
    '000000000000000000000000' +
    (handler?.substring(2) ?? '910d00a310f7dc5b29fe73458f47f519be547d3d') +
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

describe('ConditionalOrder', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Create: constructor fails if invalid params', () => {
    // bad address
    expect(() => new TestConditionalOrder('0xdeadbeef')).toThrow('Invalid handler: 0xdeadbeef')
    // bad salt

    expect(() => new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d', 'cowtomoon')).toThrow(
      'Invalid salt: cowtomoon'
    )
    expect(() => new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d', '0xdeadbeef')).toThrow(
      'Invalid salt: 0xdeadbeef'
    )
    expect(
      () =>
        new TestConditionalOrder(
          '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
          '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
        )
    ).toThrow(
      'Invalid salt: 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    )
  })

  test('Serialize: Fails if invalid params', () => {
    const order = new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d')
    expect(() => order.testEncodeStaticInput()).toThrow('SerializationFailed')
    expect(() => BaseConditionalOrder.encodeParams({ handler: '0xdeadbeef', salt: '0x', staticInput: '0x' })).toThrow(
      'SerializationFailed'
    )
  })
  })

  test('Deserialize: Fails if handler mismatch', () => {
    expect(() => TWAP.deserialize(TWAP_SERIALIZED(undefined, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'))).toThrow(
      'HandlerMismatch'
    )
  })
})

class TestConditionalOrder extends BaseConditionalOrder<string> {
  constructor(address: string, salt?: string, staticInput = '0x') {
    super('TEST', address, salt, staticInput)
  }

  encodeStaticInput(): string {
    return this.staticInput
  }

  testEncodeStaticInput(): string {
    return super.encodeStaticInputHelper(['uint256'], this.staticInput)
  }

  isValid(o: any): boolean {
    throw new Error('Method not implemented.')
  }
  serialize(): string {
    return BaseConditionalOrder.encodeParams(this.leaf)
  }
  toString(tokenFormatter: ((address: string, amount: BigNumber) => string) | undefined): string {
    throw new Error('Method not implemented.')
  }
}
