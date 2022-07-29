import CowSdk from '../../../CowSdk'
import { AllPricesResult, CompatibleQuoteParams } from '../types'

// This is a custom function that our tests can use during setup to specify
// what the response will be: OptimalRate or APIError
let outcome: AllPricesResult
function __setRateResponseOrError(response: AllPricesResult): void {
  outcome = response
}

function __createPromiseFulfilledValue<T>(value: T): PromiseFulfilledResult<T> {
  return {
    status: 'fulfilled',
    value,
  }
}

function __createPromiseRejectedWithValue<T>(
  value: T,
  reason: string
): PromiseRejectedResult & { value: T | undefined } {
  return {
    status: 'rejected',
    reason,
    value,
  }
}

// Queries all legacy endpoints for price quotes using passed parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAllPricesLegacy(_cowSdk: CowSdk, _params: CompatibleQuoteParams): Promise<AllPricesResult> {
  return {
    cowQuoteResult: outcome.cowQuoteResult,
    paraswapQuoteResult: outcome.paraswapQuoteResult,
    zeroXQuoteResult: outcome.zeroXQuoteResult,
  }
}

export { __setRateResponseOrError, __createPromiseFulfilledValue, __createPromiseRejectedWithValue, getAllPricesLegacy }
