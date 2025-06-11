import Ajv, { ValidateFunction } from 'ajv'

import schemaV0_1_0 from '../schemas/v0.1.0.json'
import schemaV0_10_0 from '../schemas/v0.10.0.json'
import schemaV0_11_0 from '../schemas/v0.11.0.json'
import schemaV0_2_0 from '../schemas/v0.2.0.json'
import schemaV0_3_0 from '../schemas/v0.3.0.json'
import schemaV0_4_0 from '../schemas/v0.4.0.json'
import schemaV0_5_0 from '../schemas/v0.5.0.json'
import schemaV0_6_0 from '../schemas/v0.6.0.json'
import schemaV0_9_0 from '../schemas/v0.9.0.json'
import schemaV1_0_0 from '../schemas/v1.0.0.json'
import schemaV1_1_0 from '../schemas/v1.1.0.json'
import schemaV1_2_0 from '../schemas/v1.2.0.json'
import schemaV1_4_0 from '../schemas/v1.4.0.json'

const ADDRESS = '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9'
const REFERRER_V0_1_0 = { address: ADDRESS, version: '0.1.0' }
const REFERRER_V0_2_0 = { address: ADDRESS }
const ORDER_CLASS_V0_1_0 = { orderClass: 'limit', version: '0.1.0' }
const ORDER_CLASS_V0_3_0 = { orderClass: 'twap' }
const QUOTE_V0_1_0 = { sellAmount: '123123', buyAmount: '1314123', version: '0.1.0' }
const QUOTE_V0_2_0 = { slippageBips: '1', version: '0.2.0' }
const QUOTE_V0_3_0 = { slippageBips: '1' }
const UTM_V0_2_0 = {
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'campaign',
  utmContent: 'content',
}

const MISSING_VERSION_ERROR = [
  {
    instancePath: '',
    keyword: 'required',
    message: "must have required property 'version'",
    params: { missingProperty: 'version' },
    schemaPath: '#/required',
  },
]

describe('Schema v0.1.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_1_0)

  const BASE_DOCUMENT = {
    version: '0.1.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test('Missing required fields', _buildAssertInvalidFn(validator, {}, MISSING_VERSION_ERROR))

  test(
    'With referrer metadata',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      appCode: 'MyApp',
      metadata: {
        referrer: REFERRER_V0_1_0,
      },
    })
  )

  test(
    'With invalid referrer metadata',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        appCode: 'MyApp',
        metadata: {
          referrer: { address: '0xas', version: '0.1.0' },
        },
      },
      [
        {
          instancePath: '/metadata/referrer/address',
          keyword: 'pattern',
          message: 'must match pattern "^0x[a-fA-F0-9]{40}$"',
          params: { pattern: '^0x[a-fA-F0-9]{40}$' },
          schemaPath: '#/properties/metadata/properties/referrer/properties/address/pattern',
        },
      ]
    )
  )
})

describe('Schema v0.2.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_2_0)

  const BASE_DOCUMENT = {
    version: '0.2.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test('Missing required fields', _buildAssertInvalidFn(validator, {}, MISSING_VERSION_ERROR))

  test(
    'With referrer v0.1.0 and quote v0.1.0 metadata',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      appCode: 'MyApp',
      metadata: {
        referrer: REFERRER_V0_1_0,
        quote: QUOTE_V0_1_0,
      },
    })
  )

  test(
    'With invalid quote metadata v0.1.0',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        appCode: 'MyApp',
        metadata: {
          referrer: REFERRER_V0_1_0,
          quote: { sellAmount: 'xx12d', buyAmount: 0.13, version: '0.1.0' },
        },
      },
      [
        {
          instancePath: '/metadata/quote/sellAmount',
          keyword: 'pattern',
          message: 'must match pattern "^\\d+$"',
          params: { pattern: '^\\d+$' },
          schemaPath: '#/properties/metadata/properties/quote/properties/buyAmount/pattern',
        },
      ]
    )
  )
})

describe('Schema v0.3.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_3_0)

  const BASE_DOCUMENT = {
    version: '0.3.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test('Missing required fields', _buildAssertInvalidFn(validator, {}, MISSING_VERSION_ERROR))

  test(
    'With environment and full metadata (both v0.1.0)',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      appCode: 'MyApp',
      environment: 'prod',
      metadata: {
        referrer: REFERRER_V0_1_0,
        quote: QUOTE_V0_1_0,
      },
    })
  )
})

describe('Schema v0.4.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_4_0)

  const BASE_DOCUMENT = {
    version: '0.4.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test('Missing required fields', _buildAssertInvalidFn(validator, {}, MISSING_VERSION_ERROR))

  test(
    'With quote metadata v0.2.0',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      appCode: 'MyApp',
      environment: 'prod',
      metadata: {
        referrer: REFERRER_V0_1_0,
        quote: QUOTE_V0_2_0,
      },
    })
  )

  test(
    'With invalid quote metadata v0.2.0',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        appCode: 'MyApp',
        environment: 'prod',
        metadata: {
          referrer: REFERRER_V0_1_0,
          quote: QUOTE_V0_1_0,
        },
      },
      [
        {
          instancePath: '/metadata/quote',
          keyword: 'required',
          message: "must have required property 'slippageBips'",
          params: { missingProperty: 'slippageBips' },
          schemaPath: '#/properties/metadata/properties/quote/required',
        },
      ]
    )
  )
})

describe('Schema v0.5.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_5_0)

  const BASE_DOCUMENT = {
    version: '0.5.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test('Missing required fields', _buildAssertInvalidFn(validator, {}, MISSING_VERSION_ERROR))

  test(
    'With order class v0.1.0',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      appCode: 'MyApp',
      environment: 'prod',
      metadata: {
        referrer: REFERRER_V0_1_0,
        quote: QUOTE_V0_2_0,
        orderClass: ORDER_CLASS_V0_1_0,
      },
    })
  )

  test(
    'With invalid order class v0.1.0',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        appCode: 'MyApp',
        environment: 'prod',
        metadata: {
          referrer: REFERRER_V0_1_0,
          quote: QUOTE_V0_2_0,
          orderClass: { orderClass: 'mooo', version: '0.1.0' }, // Invalid value
        },
      },
      [
        {
          instancePath: '/metadata/orderClass/orderClass',
          keyword: 'enum',
          message: 'must be equal to one of the allowed values',
          params: { allowedValues: ['market', 'limit', 'liquidity'] },
          schemaPath: '#/properties/metadata/properties/orderClass/properties/orderClass/enum',
        },
      ]
    )
  )
})

describe('Schema v0.6.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_6_0)

  const BASE_DOCUMENT = {
    version: '0.6.0',
    metadata: {},
  }

  test(
    'UTM Source',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        utmSource: 'twitter',
      },
    })
  )

  test(
    'UTM Medium',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        utmMedium: 'email',
      },
    })
  )

  test(
    'UTM Campaign',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        utmCampaign: 'everyone-loves-cows-2023',
      },
    })
  )

  test(
    'UTM Content',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        utmContent: 'big-fat-button',
      },
    })
  )

  test(
    'UTM Term',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        utmTerm: 'coincidence+of+wants',
      },
    })
  )

  test(
    'UTM all at once',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        utmSource: 'twitter',
        utmMedium: 'email',
        utmCampaign: 'everyone-loves-cows-2023',
        utmContent: 'big-fat-button',
        utmTerm: 'coincidence+of+wants',
      },
    })
  )
})

describe('Schema v0.9.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_9_0)

  const BASE_DOCUMENT = {
    version: '0.9.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test(
    'With minimal hooks v0.1.0',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { hooks: {} },
    })
  )

  test(
    'With pre-hooks',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        hooks: {
          pre: [
            {
              target: '0x0102030405060708091011121314151617181920',
              callData: '0x01020304',
              gasLimit: '10000',
            },
            {
              target: '0x0102030405060708091011121314151617181920',
              callData: '0x',
              gasLimit: '10000',
            },
          ],
        },
      },
    })
  )

  test(
    'With post-hooks',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        hooks: {
          post: [
            {
              target: '0x0102030405060708091011121314151617181920',
              callData: '0x01020304',
              gasLimit: '10000',
            },
            {
              target: '0x0102030405060708091011121314151617181920',
              callData: '0x',
              gasLimit: '10000',
            },
          ],
        },
      },
    })
  )

  test(
    'With pre- and post-hooks',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        hooks: {
          pre: [
            {
              target: '0x0102030405060708091011121314151617181920',
              callData: '0x01020304',
              gasLimit: '10000',
            },
          ],
          post: [
            {
              target: '0x0102030405060708091011121314151617181920',
              callData: '0x',
              gasLimit: '10000',
            },
          ],
        },
      },
    })
  )

  test(
    'With hooks and full metadata',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        quote: QUOTE_V0_3_0,
        referrer: REFERRER_V0_2_0,
        orderClass: ORDER_CLASS_V0_3_0,
        utm: UTM_V0_2_0,
        hooks: {
          pre: [
            {
              target: '0x0102030405060708091011121314151617181920',
              callData: '0x01020304',
              gasLimit: '10000',
            },
          ],
          post: [
            {
              target: '0x0102030405060708091011121314151617181920',
              callData: '0x',
              gasLimit: '10000',
            },
          ],
        },
      },
    })
  )

  test(
    'With missing required hook fields',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: {
          hooks: {
            pre: [
              {
                target: '0x0102030405060708091011121314151617181920',
                gasLimit: '10000',
              },
            ],
          },
        },
      },
      [
        {
          instancePath: '/metadata/hooks/pre/0',
          keyword: 'required',
          message: "must have required property 'callData'",
          params: { missingProperty: 'callData' },
          schemaPath: '#/properties/metadata/properties/hooks/properties/pre/items/required',
        },
      ]
    )
  )
})

describe('Schema v0.10.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_10_0)

  const BASE_DOCUMENT = {
    version: '0.10.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test(
    'With signer v0.1.0',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { signer: ADDRESS },
    })
  )

  test(
    'Signer with invalid address',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: {
          signer: '0xinvalid',
        },
      },
      [
        {
          instancePath: '/metadata/signer',
          keyword: 'pattern',
          message: 'must match pattern "^0x[a-fA-F0-9]{40}$"',
          params: { pattern: '^0x[a-fA-F0-9]{40}$' },
          schemaPath: '#/properties/metadata/properties/signer/pattern',
        },
      ]
    )
  )

  test(
    'Signer with invalid address',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: {
          signer: { address: ADDRESS },
        },
      },
      [
        {
          instancePath: '/metadata/signer',
          keyword: 'type',
          message: 'must be string',
          params: { type: 'string' },
          schemaPath: '#/properties/metadata/properties/signer/type',
        },
      ]
    )
  )
})

describe('Schema v0.11.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV0_11_0)

  const BASE_DOCUMENT = {
    version: '0.11.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test(
    'With widget v0.11.0',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { widget: { appCode: 'Pig Swap', environment: 'production' } },
    })
  )

  test(
    'With widget and no environment v0.11.0',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { widget: { appCode: 'Pig Swap' } },
    })
  )

  test(
    'Widget with no appCode v0.11.0',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: {
          widget: {
            environment: 'production',
          },
        },
      },
      [
        {
          instancePath: '/metadata/widget',
          keyword: 'required',
          message: "must have required property 'appCode'",
          params: { missingProperty: 'appCode' },
          schemaPath: '#/properties/metadata/properties/widget/required',
        },
      ]
    )
  )

  test(
    'Signer with invalid address',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: {
          signer: '0xinvalid',
        },
      },
      [
        {
          instancePath: '/metadata/signer',
          keyword: 'pattern',
          message: 'must match pattern "^0x[a-fA-F0-9]{40}$"',
          params: { pattern: '^0x[a-fA-F0-9]{40}$' },
          schemaPath: '#/properties/metadata/properties/signer/pattern',
        },
      ]
    )
  )
})

describe('Schema v1.0.0: Add partner fee', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV1_0_0)

  const BASE_DOCUMENT = {
    version: '1.0.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test(
    'Valid partner fee',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { partnerFee: { bps: 50, recipient: ADDRESS } },
    })
  )

  test(
    'Valid zero partner fee',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { partnerFee: { bps: 0, recipient: ADDRESS } },
    })
  )

  test(
    'Invalid partner fee: missing bps',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { partnerFee: { recipient: ADDRESS } },
      },
      [
        {
          instancePath: '/metadata/partnerFee',
          keyword: 'required',
          message: "must have required property 'bps'",
          params: { missingProperty: 'bps' },
          schemaPath: '#/properties/metadata/properties/partnerFee/required',
        },
      ]
    )
  )

  test(
    'Invalid partner fee: missing recipient',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { partnerFee: { bps: 50 } },
      },
      [
        {
          instancePath: '/metadata/partnerFee',
          keyword: 'required',
          message: "must have required property 'recipient'",
          params: { missingProperty: 'recipient' },
          schemaPath: '#/properties/metadata/properties/partnerFee/required',
        },
      ]
    )
  )

  test(
    'Invalid partner fee: BIPs is too low (negative)',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { partnerFee: { bps: -1, recipient: ADDRESS } },
      },
      [
        {
          instancePath: '/metadata/partnerFee/bps',
          keyword: 'minimum',
          message: 'must be >= 0',
          params: {
            comparison: '>=',
            limit: 0,
          },
          schemaPath: '#/properties/metadata/properties/partnerFee/properties/bps/minimum',
        },
      ]
    )
  )

  test(
    'Invalid partner fee: BIPs is too high (over 100%)',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { partnerFee: { bps: 10001, recipient: ADDRESS } },
      },
      [
        {
          instancePath: '/metadata/partnerFee/bps',
          keyword: 'maximum',
          message: 'must be <= 10000',
          params: {
            comparison: '<=',
            limit: 10000,
          },
          schemaPath: '#/properties/metadata/properties/partnerFee/properties/bps/maximum',
        },
      ]
    )
  )

  test(
    "Invalid partner fee: BIPs don't allow decimals",
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { partnerFee: { bps: 10.5, recipient: ADDRESS } },
      },
      [
        {
          instancePath: '/metadata/partnerFee/bps',
          keyword: 'type',
          message: 'must be integer',
          params: {
            type: 'integer',
          },
          schemaPath: '#/properties/metadata/properties/partnerFee/properties/bps/type',
        },
      ]
    )
  )
})

describe('Schema v1.0.0: Update quote definition', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV1_0_0)

  const BASE_DOCUMENT = {
    version: '1.0.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test(
    'Valid quote',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { quote: { slippageBips: 50 } },
    })
  )

  test(
    'Valid quote, with zero slippage',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { quote: { slippageBips: 0 } },
    })
  )

  test(
    'Valid quote, with maximum slippage (10,000)',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { quote: { slippageBips: 10000 } },
    })
  )

  test(
    'Invalid partner fee: unknown field',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { quote: { recipient: ADDRESS } },
      },
      [
        {
          instancePath: '/metadata/quote',
          keyword: 'required',
          message: "must have required property 'slippageBips'",
          params: { missingProperty: 'slippageBips' },
          schemaPath: '#/properties/metadata/properties/quote/required',
        },
      ]
    )
  )

  test(
    'Invalid partner fee: missing slippageBips',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { quote: {} },
      },
      [
        {
          instancePath: '/metadata/quote',
          keyword: 'required',
          message: "must have required property 'slippageBips'",
          params: { missingProperty: 'slippageBips' },
          schemaPath: '#/properties/metadata/properties/quote/required',
        },
      ]
    )
  )

  test(
    'Invalid partner fee: missing slippageBips',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { quote: { slippageBips: -1 } },
      },
      [
        {
          instancePath: '/metadata/quote/slippageBips',
          keyword: 'minimum',
          message: 'must be >= 0',
          params: {
            comparison: '>=',
            limit: 0,
          },
          schemaPath: '#/properties/metadata/properties/partnerFee/properties/bps/minimum',
        },
      ]
    )
  )

  test(
    'Invalid partner fee: missing slippageBips',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { quote: { slippageBips: 100001 } },
      },
      [
        {
          instancePath: '/metadata/quote/slippageBips',
          keyword: 'maximum',
          message: 'must be <= 10000',
          params: {
            comparison: '<=',
            limit: 10000,
          },
          schemaPath: '#/properties/metadata/properties/partnerFee/properties/bps/maximum',
        },
      ]
    )
  )
})

describe('Schema v1.1.0: Add replaced order', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV1_1_0)

  const BASE_DOCUMENT = {
    version: '1.1.0',
    metadata: {},
  }

  test(
    'Valid order id',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        replacedOrder: {
          uid: '0xff2e2e54d178997f173266817c1e9ed6fee1a1aae4b43971c53b543cffcc2969845c6f5599fbb25dbdd1b9b013daf85c03f3c63763e4bc4a',
        },
      },
    })
  )

  test(
    'Invalid order id length',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { replacedOrder: { uid: '0xgogogog' } },
      },
      [
        {
          instancePath: '/metadata/replacedOrder/uid',
          keyword: 'pattern',
          message: 'must match pattern "^0x[a-fA-F0-9]{112}$"',
          params: { pattern: '^0x[a-fA-F0-9]{112}$' },
          schemaPath: '#/properties/metadata/properties/replacedOrder/properties/uid/pattern',
        },
      ]
    )
  )

  test(
    'Invalid order id length',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { replacedOrder: {} },
      },
      [
        {
          instancePath: '/metadata/replacedOrder',
          keyword: 'required',
          message: "must have required property 'uid'",
          params: { missingProperty: 'uid' },
          schemaPath: '#/properties/metadata/properties/replacedOrder/required',
        },
      ]
    )
  )
})

describe('Schema v1.2.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV1_2_0)

  const BASE_DOCUMENT = {
    version: '1.2.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test('With quote metadata v1.1.0', () => {
    const validQuote = {
      slippageBips: 5,
      smartSlippage: true,
    }

    const validDocument = {
      ...BASE_DOCUMENT,
      metadata: {
        quote: validQuote,
      },
    }

    expect(validator(validDocument)).toBe(true)
  })

  test('With valid metadata (without smartSlippage)', () => {
    const quote = {
      slippageBips: 5,
    }

    const validDocument = {
      ...BASE_DOCUMENT,
      metadata: {
        quote,
      },
    }

    expect(validator(validDocument)).toBe(true)
  })

  test('With invalid quote metadata (invalid slippageBips)', () => {
    const invalidQuote = {
      slippageBips: 'invalid',
      smartSlippage: true,
    }

    const invalidDocument = {
      ...BASE_DOCUMENT,
      metadata: {
        quote: invalidQuote,
      },
    }

    const errors = [
      {
        instancePath: '/metadata/quote/slippageBips',
        keyword: 'pattern',
        message: 'must match pattern "^\\d+$"',
        params: { pattern: '^\\d+$' },
        schemaPath: '#/properties/metadata/properties/quote/properties/slippageBips/pattern',
      },
    ]

    expect(_buildAssertInvalidFn(validator, invalidDocument, errors)).toBeTruthy()
  })
})

describe('Schema v1.4.0: Upgrade partnerFee metadata to 1.0.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV1_4_0)

  const BASE_DOCUMENT = {
    version: '1.4.0',
    metadata: {},
  }

  test('Minimal valid schema', _buildAssertValidFn(validator, BASE_DOCUMENT))

  test(
    'Valid volume partner fee obj',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { partnerFee: { volumeBps: 100, recipient: ADDRESS } },
    })
  )
  test(
    'Valid volume partner fee array',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { partnerFee: [{ volumeBps: 100, recipient: ADDRESS }] },
    })
  )

  test(
    'Valid surplus fee obj',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { partnerFee: { maxVolumeBps: 100, surplusBps: 100, recipient: ADDRESS } },
    })
  )

  test(
    'Valid surplus fee array',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { partnerFee: [{ maxVolumeBps: 100, surplusBps: 100, recipient: ADDRESS }] },
    })
  )

  test(
    'Valid price improvement fee obj',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { partnerFee: { maxVolumeBps: 100, priceImprovementBps: 100, recipient: ADDRESS } },
    })
  )

  test(
    'Valid price improvement fee array',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: { partnerFee: [{ maxVolumeBps: 100, priceImprovementBps: 100, recipient: ADDRESS }] },
    })
  )

  test(
    'Valid multiple partner fees',
    _buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        partnerFee: [
          { volumeBps: 100, recipient: ADDRESS },
          { maxVolumeBps: 100, surplusBps: 100, recipient: ADDRESS },
          { maxVolumeBps: 100, priceImprovementBps: 100, recipient: ADDRESS },
        ],
      },
    })
  )

  test(
    'Invalid partner fee. Pure BPS no longer allowed',
    _buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { partnerFee: { bps: 50, recipient: ADDRESS } },
      },
      [
        {
          instancePath: '/metadata/partnerFee',
          schemaPath: '#/properties/metadata/properties/partnerFee/oneOf/0/type',
          keyword: 'type',
          params: {
            type: 'array',
          },
          message: 'must be array',
        },
        {
          instancePath: '/metadata/partnerFee',
          schemaPath: '#/oneOf/0/required',
          keyword: 'required',
          params: {
            missingProperty: 'volumeBps',
          },
          message: "must have required property 'volumeBps'",
        },
        {
          instancePath: '/metadata/partnerFee',
          schemaPath: '#/oneOf/1/required',
          keyword: 'required',
          params: {
            missingProperty: 'surplusBps',
          },
          message: "must have required property 'surplusBps'",
        },
        {
          instancePath: '/metadata/partnerFee',
          schemaPath: '#/oneOf/2/required',
          keyword: 'required',
          params: {
            missingProperty: 'priceImprovementBps',
          },
          message: "must have required property 'priceImprovementBps'",
        },
        {
          instancePath: '/metadata/partnerFee',
          schemaPath: '#/oneOf',
          keyword: 'oneOf',
          params: {
            passingSchemas: null,
          },
          message: 'must match exactly one schema in oneOf',
        },
        {
          instancePath: '/metadata/partnerFee',
          schemaPath: '#/properties/metadata/properties/partnerFee/oneOf',
          keyword: 'oneOf',
          params: {
            passingSchemas: null,
          },
          message: 'must match exactly one schema in oneOf',
        },
      ]
    )
  )
})

function _buildAssertValidFn(validator: ValidateFunction, doc: any) {
  return () => {
    // when
    const actual = validator(doc)
    // then
    expect(validator.errors).toBeFalsy()
    expect(actual).toBeTruthy()
  }
}

function _buildAssertInvalidFn(validator: ValidateFunction, doc: any, errors: any) {
  return () => {
    // when
    const actual = validator(doc)
    // then
    expect(actual).toBeFalsy()
    expect(validator.errors).toEqual(errors)
  }
}
