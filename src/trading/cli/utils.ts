export function printJSON(data: any): string {
  return JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 4)
}
