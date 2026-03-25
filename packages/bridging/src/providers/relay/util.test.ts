import { ETH_ADDRESS } from '@cowprotocol/sdk-config'

import { computeFeeBps, computeFeeInBuyCurrency, computeSlippageBps, fromRelayAddress, mapRelayCurrencyToTokenInfo, toRelayAddress } from './util'

import type { RelayCurrency, RelayFees, RelayQuoteDetails } from './types'

function makeDetails(overrides: Partial<RelayQuoteDetails> = {}): RelayQuoteDetails {
  return {
    operation: 'bridge',
    sender: '0xsender',
    recipient: '0xrecipient',
    currencyIn: {
      currency: { chainId: 8453, address: '0xusdc', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      amount: '1000000',
      amountFormatted: '1.0',
      amountUsd: '1.00',
    },
    currencyOut: {
      currency: { chainId: 1, address: '0xusdc-eth', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      amount: '990000',
      amountFormatted: '0.99',
      amountUsd: '0.99',
    },
    rate: '0.99',
    timeEstimate: 15,
    ...overrides,
  }
}

function makeFees(overrides: Partial<RelayFees> = {}): RelayFees {
  const defaultAmount = {
    currency: { chainId: 8453, address: '0x0', symbol: 'ETH', name: 'Ether', decimals: 18 },
    amount: '10000',
    amountFormatted: '0.00001',
    amountUsd: '0.02',
  }
  return {
    gas: { ...defaultAmount },
    relayer: { ...defaultAmount, amount: '5000', amountUsd: '0.01' },
    relayerGas: { ...defaultAmount, amount: '3000', amountUsd: '0.005' },
    relayerService: { ...defaultAmount, amount: '2000', amountUsd: '0.005' },
    ...overrides,
  }
}

describe('computeSlippageBps', () => {
  it('uses slippageTolerance.destination.percent when available', () => {
    const details = makeDetails({
      slippageTolerance: {
        destination: { usd: '0.50', value: '5000', percent: '0.50' },
      },
    })
    // 0.50% * 100 = 50 bps
    expect(computeSlippageBps(details)).toBe(50)
  })

  it('falls back to USD values when slippageTolerance is absent', () => {
    const details = makeDetails()
    // (1 - 0.99/1.00) * 10000 = 100 bps
    expect(computeSlippageBps(details)).toBe(100)
  })

  it('returns 0 when input USD is 0', () => {
    const details = makeDetails({
      currencyIn: { ...makeDetails().currencyIn, amountUsd: '0' },
    })
    expect(computeSlippageBps(details)).toBe(0)
  })

  it('returns 0 when output equals input', () => {
    const details = makeDetails({
      currencyOut: { ...makeDetails().currencyOut, amountUsd: '1.00' },
    })
    expect(computeSlippageBps(details)).toBe(0)
  })
})

describe('computeFeeBps', () => {
  it('computes fee bps from relayer USD vs input USD', () => {
    const details = makeDetails()
    const fees = makeFees()
    // 0.01 / 1.00 * 10000 = 100 bps
    expect(computeFeeBps(details, fees)).toBe(100)
  })

  it('returns 0 when input USD is 0', () => {
    const details = makeDetails({
      currencyIn: { ...makeDetails().currencyIn, amountUsd: '0' },
    })
    expect(computeFeeBps(details, makeFees())).toBe(0)
  })
})

describe('computeFeeInBuyCurrency', () => {
  it('computes fee amount in buy currency using bigint arithmetic', () => {
    const details = makeDetails()
    const fees = makeFees()
    // feeAmount=5000, buyAmount=990000, inAmount=1000000
    // (5000 * 990000) / 1000000 = 4950
    expect(computeFeeInBuyCurrency(fees, details)).toBe(BigInt(4950))
  })

  it('returns 0 when input amount is 0', () => {
    const details = makeDetails({
      currencyIn: { ...makeDetails().currencyIn, amount: '0' },
    })
    expect(computeFeeInBuyCurrency(makeFees(), details)).toBe(BigInt(0))
  })
})

describe('mapRelayCurrencyToTokenInfo', () => {
  it('maps ERC-20 currency to TokenInfo', () => {
    const currency: RelayCurrency = {
      chainId: 8453,
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    }
    const result = mapRelayCurrencyToTokenInfo(currency)
    expect(result.address).toBe('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913')
    expect(result.chainId).toBe(8453)
    expect(result.symbol).toBe('USDC')
  })

  it('maps native 0x0 address to ETH_ADDRESS', () => {
    const currency: RelayCurrency = {
      chainId: 1,
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ether',
      decimals: 18,
    }
    const result = mapRelayCurrencyToTokenInfo(currency)
    expect(result.address).toBe(ETH_ADDRESS)
  })
})

describe('fromRelayAddress', () => {
  it('converts Relay native address to ETH_ADDRESS', () => {
    expect(fromRelayAddress('0x0000000000000000000000000000000000000000')).toBe(ETH_ADDRESS)
  })

  it('passes through ERC-20 addresses unchanged', () => {
    const addr = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
    expect(fromRelayAddress(addr)).toBe(addr)
  })
})

describe('toRelayAddress', () => {
  it('converts ETH_ADDRESS to Relay native address', () => {
    expect(toRelayAddress(ETH_ADDRESS)).toBe('0x0000000000000000000000000000000000000000')
  })

  it('passes through ERC-20 addresses unchanged', () => {
    const addr = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
    expect(toRelayAddress(addr)).toBe(addr)
  })
})
