export async function stringifyDeterministic(obj: any): Promise<string> {
  const { default: stringify } = await import('json-stringify-deterministic')
  return stringify(obj)
}
