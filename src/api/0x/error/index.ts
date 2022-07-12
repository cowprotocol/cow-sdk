import log from 'loglevel'

interface ValidationError {
  field: string
  code: number
  reason: string
}

export interface ZeroXErrorResponse {
  code: number
  reason: string
  validationErrors?: ValidationError[]
}

export const logPrefix = '0x-sdk:'
export default class ZeroXError {
  name = 'ZeroXError'
  description
  message

  // Status 400 errors - https://docs.0x.org/0x-api-swap/api-references#introduction
  public static async getErrorMessage(response: Response) {
    try {
      const errorResponse: ZeroXErrorResponse = await response.json()

      if (errorResponse.validationErrors?.length) {
        const errorMessage = _extractFirstValidationError(errorResponse as Required<ZeroXErrorResponse>)
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage
      } else {
        log.error(logPrefix, 'Unknown reason for bad price request', errorResponse)
        return errorResponse.reason
      }
    } catch (error) {
      log.error(logPrefix, 'Error handling a 400 error. Likely a problem deserialising the JSON response')
      return 'Price fetch failed. This may be due to a server or network connectivity issue. Please try again later.'
    }
  }

  static async getErrorFromStatusCode(response: Response) {
    switch (response.status) {
      case 400:
        return this.getErrorMessage(response)

      case 404:
        return 'Not found'
      case 429:
        return 'Too many requests - Rate limit exceeded'
      case 500:
        return 'Internal server error'
      case 501:
        return 'Not Implemented'
      case 503:
        return 'Server Error - Too many open connections'

      default:
        log.error(
          logPrefix,
          '[ZeroXError::getErrorFromStatusCode] Error fetching quote, status code:',
          response.status || 'unknown'
        )
        return 'Error fetching quote'
    }
  }

  constructor(apiError: ZeroXErrorResponse) {
    this.description = apiError.validationErrors?.[0].reason || apiError.reason
    this.message = apiError.reason
  }
}

function _extractFirstValidationError(response: Required<ZeroXErrorResponse>) {
  return `${logPrefix}${response.reason}: ${response.validationErrors[0].reason}`
}
