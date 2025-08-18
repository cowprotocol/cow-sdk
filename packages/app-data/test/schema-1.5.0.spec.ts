import Ajv from 'ajv'

import schemaV1_5_0 from '../src/schemas/v1.5.0.json'
import { buildAssertInvalidFn, buildAssertValidFn } from './test-utils'

describe('Schema v1.5.0: Add bridging metadata 1.0.0', () => {
  const ajv = new Ajv()
  const validator = ajv.compile(schemaV1_5_0)

  const BASE_DOCUMENT = {
    version: '1.5.0',
    metadata: {},
  }

  test('Minimal valid schema', buildAssertValidFn(validator, BASE_DOCUMENT))

  test(
    'Valid destination token address and chainId (EVM)',
    buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        bridging: {
          destinationTokenAddress: '0x00E989b87700514118Fa55326CD1cCE82faebEF6',
          destinationChainId: '42161',
        },
      },
    }),
  )

  test(
    'Valid destination token address and chainId (non-EVM)',
    buildAssertValidFn(validator, {
      ...BASE_DOCUMENT,
      metadata: {
        bridging: {
          destinationTokenAddress: 'A.b19436aae4d94622.FiatToken',
          destinationChainId: 'hedera-hashgraph',
        },
      },
    }),
  )

  test(
    'Invalid destination token address (should not contain %)',
    buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: { bridging: { destinationTokenAddress: '0x1%', destinationChainId: '42161' } },
      },
      [
        {
          instancePath: '/metadata/bridging/destinationTokenAddress',
          keyword: 'pattern',
          message: 'must match pattern "^[a-zA-Z0-9\\-.]{1,64}$"',
          params: {
            pattern: '^[a-zA-Z0-9\\-.]{1,64}$',
          },
          schemaPath: '#/properties/metadata/properties/bridging/properties/destinationTokenAddress/pattern',
        },
      ],
    ),
  )

  test(
    'Invalid destination chainId (should not contain spaces)',
    buildAssertInvalidFn(
      validator,
      {
        ...BASE_DOCUMENT,
        metadata: {
          bridging: {
            destinationTokenAddress: '0x00E989b87700514118Fa55326CD1cCE82faebEF6',
            destinationChainId: 'a 2',
          },
        },
      },
      [
        {
          instancePath: '/metadata/bridging/destinationChainId',
          keyword: 'pattern',
          message: 'must match pattern "^[a-zA-Z0-9\\-_]{1,32}$"',
          params: {
            pattern: '^[a-zA-Z0-9\\-_]{1,32}$',
          },
          schemaPath: '#/properties/metadata/properties/bridging/properties/destinationChainId/pattern',
        },
      ],
    ),
  )
})
