import { BigNumber } from 'ethers'
import { BaseConditionalOrder } from './conditionalorder'
import { TWAP } from './types/twap'

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

  test('id: Returns correct id', () => {
    const order = new TestConditionalOrder(
      '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
      '0x9379a0bf532ff9a66ffde940f94b1a025d6f18803054c1aef52dc94b15255bbe'
    )
    expect(order.id).toEqual('0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3')
  })

  test('leafToId: Returns correct id', () => {
    const order = new TestConditionalOrder(
      '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
      '0x9379a0bf532ff9a66ffde940f94b1a025d6f18803054c1aef52dc94b15255bbe'
    )
    expect(BaseConditionalOrder.leafToId(order.leaf)).toEqual(
      '0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3'
    )
  })

  test('Deserialize: Fails if handler mismatch', () => {
    expect(() => TWAP.deserialize(TWAP_SERIALIZED(undefined, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'))).toThrow(
      'HandlerMismatch'
    )
  })
})

class TestConditionalOrder extends BaseConditionalOrder<string, string> {
  constructor(address: string, salt?: string, staticInput = '0x') {
    super(address, salt, staticInput)
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

  isValid(_o: unknown): boolean {
    throw new Error('Method not implemented.')
  }
  serialize(): string {
    return BaseConditionalOrder.encodeParams(this.leaf)
  }
  toString(_tokenFormatter?: (address: string, amount: BigNumber) => string): string {
    throw new Error('Method not implemented.')
  }
}
