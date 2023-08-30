import { ConditionalOrder } from './ConditionalOrder'
import { IsValidResult, PollResultErrors } from './types'
import { Twap } from './orderTypes/Twap'
import { encodeParams } from './utils'

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

describe('Constuctor', () => {
  test('Create TestConditionalOrder', () => {
    // bad address
    expect(() => new TestConditionalOrder('0xdeadbeef')).toThrow('Invalid handler: 0xdeadbeef')
  })

  test('Fail if bad address', () => {
    // bad address
    expect(() => new TestConditionalOrder('0xdeadbeef')).toThrow('Invalid handler: 0xdeadbeef')
  })

  describe('Fail if bad salt', () => {
    test('Fails if salt is not an hex', () => {
      expect(() => new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d', 'cowtomoon')).toThrow(
        'Invalid salt: cowtomoon'
      )
    })

    test('Fails if salt is too short (not 32 bytes)', () => {
      expect(() => new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d', '0xdeadbeef')).toThrow(
        'Invalid salt: 0xdeadbeef'
      )
    })

    test('Fails if salt is too long (not 32 bytes)', () => {
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
  })
})
describe('Deserialize: Decode static input', () => {
  test('Fails if handler mismatch', () => {
    expect(() => Twap.deserialize(TWAP_SERIALIZED(undefined, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'))).toThrow(
      'HandlerMismatch'
    )
  })
})

describe('Serialize: Encode static input', () => {
  test('Serialize: Fails if invalid params', () => {
    const order = new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d')
    expect(() => order.testEncodeStaticInput()).toThrow()
  })
})

describe('Compute orderUid', () => {
  test('Returns correct id', () => {
    const order = new TestConditionalOrder(
      '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
      '0x9379a0bf532ff9a66ffde940f94b1a025d6f18803054c1aef52dc94b15255bbe'
    )
    expect(order.id).toEqual('0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3')
  })

  test('Derive OrderId from leaf data', () => {
    const order = new TestConditionalOrder(
      '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
      '0x9379a0bf532ff9a66ffde940f94b1a025d6f18803054c1aef52dc94b15255bbe'
    )
    expect(ConditionalOrder.leafToId(order.leaf)).toEqual(
      '0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3'
    )
  })
})

class TestConditionalOrder extends ConditionalOrder<string, string> {
  isSingleOrder = true

  constructor(address: string, salt?: string, data = '0x') {
    super({
      handler: address,
      salt,
      data,
    })
  }

  get orderType(): string {
    return 'TEST'
  }

  encodeStaticInput(): string {
    return this.staticInput
  }

  testEncodeStaticInput(): string {
    return super.encodeStaticInputHelper(['uint256'], this.staticInput)
  }

  transformStructToData(params: string): string {
    return params
  }

  transformDataToStruct(params: string): string {
    return params
  }

  protected pollValidate(): Promise<PollResultErrors | undefined> {
    throw new Error('Method not implemented.')
  }

  isValid(): IsValidResult {
    throw new Error('Method not implemented.')
  }
  serialize(): string {
    return encodeParams(this.leaf)
  }

  toString(): string {
    throw new Error('Method not implemented.')
  }
}

describe('Constuctor', () => {})
