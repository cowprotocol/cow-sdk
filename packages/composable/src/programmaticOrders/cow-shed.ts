import * as v from 'valibot'

import {
  ADDRESS_SCHEMA,
  BYTES_32_SCHEMA,
  SAFE_INTEGER_SCHEMA,
  SUPPORTED_EVM_CHAIN_ID_SCHEMA,
  UINT256_SCHEMA,
} from './schemas'

export const GET_DEPLOYED_COW_SHEDS_PARAMS_SCHEMA = v.object({
  owner: ADDRESS_SCHEMA,
  chainId: v.optional(SUPPORTED_EVM_CHAIN_ID_SCHEMA),
})
export type GetDeployedCowShedsParams = v.InferInput<typeof GET_DEPLOYED_COW_SHEDS_PARAMS_SCHEMA>

export const COW_SHEDS_QUERY = `
  query DeployedCowSheds($owner: String!, $chainId: Int, $offset: Int! = 0, $limit: Int! = 100, $direction: String! = "desc") {
    ownerMappings(
      where: { owner: $owner, chainId: $chainId, addressType: cowshed_proxy }
      offset: $offset
      limit: $limit
      orderBy: "address"
      orderDirection: $direction
    ) {
      items { address chainId txHash blockNumber }
      totalCount
    }
  }
`

export const COW_SHED_SCHEMA = v.object({
  address: ADDRESS_SCHEMA,
  chainId: v.pipe(SAFE_INTEGER_SCHEMA, v.minValue(1)),
  txHash: BYTES_32_SCHEMA,
  blockNumber: UINT256_SCHEMA,
})

export type DeployedCowShed = v.InferOutput<typeof COW_SHED_SCHEMA>
