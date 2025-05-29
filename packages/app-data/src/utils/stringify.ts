export async function stringifyDeterministic(obj: Record<string, unknown>): Promise<string> {
  const { default: stringify } = await import('json-stringify-deterministic')
  return stringify(obj)
}
