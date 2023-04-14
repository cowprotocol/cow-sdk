import { ApiError } from './generated'

type TransformedError<T> = T & {
  rawApiError: ApiError
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function transformError<T>(error: ApiError): TransformedError<T> | Error {
  if (isApiError(error)) {
    return {
      ...error.body,
      rawApiError: error,
    }
  }

  return error
}
