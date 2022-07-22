import log from 'loglevel'
import { APIError } from 'paraswap'
import { CowError } from '../../../utils/common'
import { LOG_PREFIX } from '../constants'

export default class ParaswapError extends CowError {
  name = 'ParaswapError'
  description
  message

  public static async getErrorMessage(response: Response) {
    try {
      const errorResponse: APIError = await response.json()

      if (errorResponse.data?.error || errorResponse.message) {
        const errorMessage = errorResponse.data?.error || errorResponse.message
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage
      } else {
        throw new Error('Error response body properties "data.error" and "message" missing.')
      }
    } catch (error) {
      const isError = error instanceof Error
      log.error(
        LOG_PREFIX,
        'Error handling a 4xx error. Likely a problem deserialising the JSON response.',
        isError && error?.message
      )
      return isError
        ? error?.message
        : 'Price fetch failed. This may be due to a server or network connectivity issue. Please try again later.'
    }
  }

  static async getErrorFromStatusCode(response: Response) {
    switch (response.status) {
      case 400:
        return this.getErrorMessage(response)

      case 404:
        return 'Not found'

      default:
        log.error(LOG_PREFIX, 'Error fetching quote, status code:', response.status || 'unknown')
        return 'Error fetching quote'
    }
  }

  constructor(apiError: APIError) {
    super(apiError.message, apiError.status?.toString())
    this.description = apiError.data?.error || apiError.message
    this.message = apiError.message
  }
}
