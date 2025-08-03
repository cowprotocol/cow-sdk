import stringify from 'json-stringify-deterministic'

export async function stringifyDeterministic(obj: object): Promise<string> {
  return stringify(obj)
}
