export class CowError extends Error {
  error_code?: string

  constructor(message: string, error_code?: string) {
    super(message)
    this.error_code = error_code
  }
}

export function objectToQueryString(o: { [key: string]: string | number | undefined }): string {
  if (!o) {
    return ''
  }

  const qs = new URLSearchParams()

  for (const key of Object.keys(o)) {
    const value = o[key]
    if (value) {
      qs.append(key, value.toString())
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

export const delay = <T = void>(ms = 100, result?: T): Promise<T> =>
  new Promise((resolve) => setTimeout(resolve, ms, result))

export function withTimeout<T>(promise: Promise<T>, ms: number, context?: string): Promise<T> {
  const failOnTimeout = delay(ms).then(() => {
    const errorMessage = 'Timeout after ' + ms + ' ms'
    throw new Error(context ? `${context}. ${errorMessage}` : errorMessage)
  })

  return Promise.race([promise, failOnTimeout])
}

export function isPromiseFulfilled<T>(
  promiseResult: PromiseSettledResult<T>
): promiseResult is PromiseFulfilledResult<T> {
  return promiseResult.status === 'fulfilled'
}
