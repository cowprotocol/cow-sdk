import { ConditionalOrder } from '../../ConditionalOrder'
import { IsValidResult, PollResultErrors } from '../../types'
import { encodeParams } from '../../utils'

export class TestConditionalOrder extends ConditionalOrder<string, string> {
  isSingleOrder: boolean

  constructor(address: string, salt?: string, data = '0x', isSingleOrder = true) {
    super({
      handler: address,
      salt,
      data,
    })
    this.isSingleOrder = isSingleOrder
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
