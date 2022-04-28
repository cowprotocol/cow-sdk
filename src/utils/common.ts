export class CowError extends Error {
  error_code?: string

  constructor(message: string, error_code?: string) {
    super(message)
    this.error_code = error_code
  }
}

export function objectToQueryString(o: any): string {
  if (!o) {
    return ''
  }

  const qs = new URLSearchParams()

  for (const key of Object.keys(o)) {
    const value = o[key]
    if (value) {
      qs.append(key, value)
    }
  }

  const qsResult = qs.toString()

  return qsResult ? `?${qsResult}` : ''
}

export const logPrefix = 'cow-sdk:'

export function fromHexString(hexString: string) {
  const stringMatch = hexString.match(/.{1,2}/g)
  if (!stringMatch) return
  return new Uint8Array(stringMatch.map((byte) => parseInt(byte, 16)))
}
