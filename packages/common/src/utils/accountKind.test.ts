import {
  classifyAccount,
  DEFAULT_WRAPPING_DELEGATES,
  extractEip7702Delegate,
  isEip7702DelegationCode,
  makeWrappingDelegateRegistry,
  WrappingDelegateRegistry,
} from './accountKind'

const ZERO = '0x0000000000000000000000000000000000000000'
// Real EIP-7702 marker observed on mainnet (Metamask Smart Account delegator):
// `0xef0100 || 0x63c0c19a282a1b52b07dd5a65b58948a07dae32b`.
const MM_DELEGATION = '0xef010063c0c19a282a1b52b07dd5a65b58948a07dae32b'
const MM_DELEGATE_ADDR = '63c0c19a282a1b52b07dd5a65b58948a07dae32b'
const REGULAR_CONTRACT_CODE = '0x6080604052348015600f57600080fd5b50'

function makeAdapter(code: string) {
  return { getCode: async (_: string) => code }
}

describe('isEip7702DelegationCode', () => {
  it('matches the canonical 23-byte marker', () => {
    expect(isEip7702DelegationCode(MM_DELEGATION)).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isEip7702DelegationCode(MM_DELEGATION.toUpperCase())).toBe(true)
  })

  it('rejects empty code', () => {
    expect(isEip7702DelegationCode('0x')).toBe(false)
  })

  it('rejects regular contract code', () => {
    expect(isEip7702DelegationCode(REGULAR_CONTRACT_CODE)).toBe(false)
  })

  it('rejects 7702 prefix with wrong length', () => {
    expect(isEip7702DelegationCode('0xef0100abcd')).toBe(false)
    expect(isEip7702DelegationCode(MM_DELEGATION + 'ab')).toBe(false)
  })
})

describe('extractEip7702Delegate', () => {
  it('returns the 20-byte delegate from a marker', () => {
    expect(extractEip7702Delegate(MM_DELEGATION)).toBe(MM_DELEGATE_ADDR)
  })

  it('returns null for non-delegation code', () => {
    expect(extractEip7702Delegate('0x')).toBeNull()
    expect(extractEip7702Delegate(REGULAR_CONTRACT_CODE)).toBeNull()
  })
})

describe('classifyAccount', () => {
  it('classifies empty code as eoa', async () => {
    expect(await classifyAccount(makeAdapter('0x'), ZERO)).toBe('eoa')
  })

  it('classifies undefined code as eoa', async () => {
    const adapter = { getCode: async (_: string) => undefined }
    expect(await classifyAccount(adapter, ZERO)).toBe('eoa')
  })

  it('classifies 7702 marker not in registry as delegated-eoa-plain', async () => {
    expect(await classifyAccount(makeAdapter(MM_DELEGATION), ZERO)).toBe('delegated-eoa-plain')
  })

  it('classifies 7702 marker in registry as delegated-eoa-wrapping', async () => {
    const registry: WrappingDelegateRegistry = {
      wrappingDelegates: new Set([MM_DELEGATE_ADDR]),
    }
    expect(await classifyAccount(makeAdapter(MM_DELEGATION), ZERO, registry)).toBe('delegated-eoa-wrapping')
  })

  it('classifies regular contract code as contract', async () => {
    expect(await classifyAccount(makeAdapter(REGULAR_CONTRACT_CODE), ZERO)).toBe('contract')
  })

  it('default registry is empty so every 7702 marker is plain', async () => {
    expect(DEFAULT_WRAPPING_DELEGATES.wrappingDelegates.size).toBe(0)
    expect(await classifyAccount(makeAdapter(MM_DELEGATION), ZERO)).toBe('delegated-eoa-plain')
  })
})

describe('makeWrappingDelegateRegistry', () => {
  it('accepts checksum addresses with 0x prefix', async () => {
    const registry = makeWrappingDelegateRegistry(['0x63C0c19A282a1B52B07dD5a65b58948A07DAE32B'])
    expect(await classifyAccount(makeAdapter(MM_DELEGATION), ZERO, registry)).toBe('delegated-eoa-wrapping')
  })

  it('accepts lowercase addresses with 0x prefix', async () => {
    const registry = makeWrappingDelegateRegistry(['0x63c0c19a282a1b52b07dd5a65b58948a07dae32b'])
    expect(await classifyAccount(makeAdapter(MM_DELEGATION), ZERO, registry)).toBe('delegated-eoa-wrapping')
  })

  it('accepts lowercase addresses without 0x prefix', async () => {
    const registry = makeWrappingDelegateRegistry([MM_DELEGATE_ADDR])
    expect(await classifyAccount(makeAdapter(MM_DELEGATION), ZERO, registry)).toBe('delegated-eoa-wrapping')
  })

  it('returns empty registry for empty input', () => {
    expect(makeWrappingDelegateRegistry([]).wrappingDelegates.size).toBe(0)
  })
})
