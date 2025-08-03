export async function stringifyDeterministic(obj: object): Promise<string> {
  const stringify = (await import('json-stringify-deterministic')).default
  return stringify(obj)
}
