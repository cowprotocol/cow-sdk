'use strict'

const paraswap = jest.createMockFromModule('paraswap')

// This is a custom function that our tests can use during setup to specify
// what the response will be: OptimalRate or APIError
let outcome
function __setRateResponseOrError(response) {
  outcome = response
}

function __getOutcome() {
  return outcome
}

// custom paraswap api
class ParaSwap {
  async getRate() {
    if (!outcome) throw Error('Please call paraswap.__setRateResponseOrError first')

    return outcome
  }
}

paraswap.__getOutcome = __getOutcome
paraswap.__setRateResponseOrError = __setRateResponseOrError
paraswap.ParaSwap = ParaSwap

module.exports = paraswap
