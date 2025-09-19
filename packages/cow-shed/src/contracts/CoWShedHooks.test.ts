import { CowShedHooks, clearAllCowShedHooksCaches } from './CoWShedHooks'
import { ICoWShedCall } from '../types'
import { ContractsSigningScheme as SigningScheme } from '@cowprotocol/sdk-contracts-ts'
import { AdaptersTestSetup, createAdapters } from '../../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION } from '../const'

// information from mint and dai example of cow-shed repository
// https://github.com/cowdao-grants/cow-shed/blob/main/examples/mintDaiAndSwap.ts
const MOCK_COW_SHED_FACTORY = '0xa9efDEf197130B945462163a0B852019BA529a66'
const MOCK_COW_SHED_IMPLEMENTATION = '0x49AeF2C4005Bf572665b09014A563B5b9E46Df21'
const MOCK_INIT_CODE =
  '0x60a034608e57601f61037138819003918201601f19168301916001600160401b038311848410176093578084926040948552833981010312608e57604b602060458360a9565b920160a9565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc556040516102b490816100bd8239608051818181608f01526101720152f35b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b0382168203608e5756fe60806040526004361015610018575b3661019457610194565b6000803560e01c908163025b22bc1461003b575063f851a4400361000e5761010d565b3461010a5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261010a5773ffffffffffffffffffffffffffffffffffffffff60043581811691828203610106577f0000000000000000000000000000000000000000000000000000000000000000163314600014610101577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b8280a280f35b61023d565b8380fd5b80fd5b346101645760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc360112610164576020610146610169565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b600080fd5b333003610101577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101ef575b1561023d5760046040517ff92ee8a9000000000000000000000000000000000000000000000000000000008152fd5b507f400ada75000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000006000351614156101c0565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546000808092368280378136915af43d82803e1561027a573d90f35b3d90fdfea2646970667358221220c7c26ff3040b96a28e96d6d27b743972943aeaef81cc821544c5fe1e24f9b17264736f6c63430008190033'

const USER_MOCK = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const PROXY_MOCK = '0xB34c56557a1ec3617572C6cDd814A1a9F9A20A51'

const createCallsForAdapter = (adapter: any): ICoWShedCall[] => [
  {
    target: adapter.ZERO_ADDRESS,
    value: BigInt(0),
    callData: '0xabcdef',
    allowFailure: false,
    isDelegateCall: false,
  },
]

describe('CowShedHooks', () => {
  let adapters: AdaptersTestSetup

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear shared caches before each test to prevent test interference
    clearAllCowShedHooksCaches()
  })

  describe('constructor', () => {
    it('should create a new instance of CowShedHooks with custom values', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      adapterNames.forEach((adapterName) => {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        expect(cowShed).toBeInstanceOf(CowShedHooks)
        expect(cowShed.getFactoryAddress()).toBe(MOCK_COW_SHED_FACTORY)
        expect(cowShed.getImplementationAddress()).toBe(MOCK_COW_SHED_IMPLEMENTATION)
        expect(cowShed.proxyCreationCode()).toBe(MOCK_INIT_CODE)
      })
    })

    it('should create a new instance of CowShedHooks with default values', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      adapterNames.forEach((adapterName) => {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        const defaultCowShed = new CowShedHooks(1)
        expect(defaultCowShed).toBeInstanceOf(CowShedHooks)
        expect(defaultCowShed.getFactoryAddress()).toBe(COW_SHED_FACTORY[defaultCowShed.version])
        expect(defaultCowShed.getImplementationAddress()).toBe(COW_SHED_IMPLEMENTATION[defaultCowShed.version])

        const proxyCode = defaultCowShed.proxyCreationCode()
        expect(proxyCode).toMatch(/^0x[a-fA-F0-9]+$/) // Valid hex string
        expect(proxyCode.length).toBeGreaterThan(100) // Reasonable length
        expect(defaultCowShed.proxyCreationCode()).toBe(
          '0x60a03461009557601f61033d38819003918201601f19168301916001600160401b0383118484101761009957808492604094855283398101031261009557610052602061004b836100ad565b92016100ad565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5560405161027b90816100c28239608051818181608b01526101750152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036100955756fe60806040526004361015610018575b3661019757610197565b5f3560e01c8063025b22bc146100375763f851a4400361000e57610116565b346101125760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101125760043573ffffffffffffffffffffffffffffffffffffffff81169081810361011257337f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff160361010d577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a2005b61023d565b5f80fd5b34610112575f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261011257602061014e61016c565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b33300361010d577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101f0575b1561023d577ff92ee8a9000000000000000000000000000000000000000000000000000000005f5260045ffd5b507f400ada75000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000005f351614156101c3565b5f807f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54368280378136915af43d5f803e15610277573d5ff35b3d5ffd',
        )
      })
    })
  })

  describe('computeProxyAddress', () => {
    it('should use the right parameters on the proxy address for custom values', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      adapterNames.forEach((adapterName) => {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const calculatedProxy = cowShed.proxyOf(USER_MOCK)
        expect(calculatedProxy).toBe(PROXY_MOCK)
      })
    })

    it('should use the right parameters on the proxy address for default values', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      adapterNames.forEach((adapterName) => {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        const defaultCowShed = new CowShedHooks(1)
        const calculatedProxy = defaultCowShed.proxyOf('0x76b0340e50BD9883D8B2CA5fd9f52439a9e7Cf58')
        expect(calculatedProxy).toBe('0x66545B93A314e5BdEC9E5Ff9c4D2C7054e6afb04')
      })
    })
  })

  describe('getDomain', () => {
    it('should return the correct domain with normalization', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      adapterNames.forEach((adapterName) => {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const domain = cowShed.getDomain(adapter.ZERO_ADDRESS)

        expect(domain).toEqual({
          name: 'COWShed',
          version: '1.0.1',
          chainId: 1,
          verifyingContract: adapter.ZERO_ADDRESS.toLowerCase(),
        })

        // Test with mixed case address to verify normalization
        const testProxy = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12'
        const testProxyDomain = cowShed.getDomain(testProxy)

        expect(testProxyDomain).toEqual({
          name: 'COWShed',
          version: '1.0.1',
          chainId: 1,
          verifyingContract: testProxy,
        })
      })
    })
  })

  describe('infoToSign', () => {
    it('should return the correct info to sign with normalization', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      adapterNames.forEach((adapterName) => {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const calls: ICoWShedCall[] = [
          {
            target: '0x1234ABCD', // Mixed case to test normalization
            value: BigInt(100),
            callData: '0x1234',
            allowFailure: false,
            isDelegateCall: false,
          },
        ]
        const nonce = '1'
        const deadline = BigInt(1000000)
        const testProxy = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12'

        const result = cowShed.infoToSign(calls, nonce, deadline, testProxy)

        expect(result).toHaveProperty('domain')
        expect(result).toHaveProperty('types')
        expect(result).toHaveProperty('message')

        // Fix: Test the normalized message structure
        const message = result.message as {
          calls: Array<{ target: string; value: bigint }>
          deadline: string
          nonce: string
        }
        const domain = result.domain as { chainId: number; verifyingContract: string }

        expect(message.calls).toBeDefined()
        expect(message.calls.length).toBeGreaterThan(0)
        expect(message.calls[0]?.target).toBe('0x1234ABCD')
        expect(message.calls[0]?.value).toBe(BigInt(100)) // Value should remain bigint
        expect(message.deadline).toBe('1000000') // Should be converted to string
        expect(message.nonce).toBe(nonce)

        // Test domain normalization
        expect(domain.chainId).toBe(1) // Should be number
        expect(domain.verifyingContract).toBe(testProxy)
      })
    })
  })

  describe('encodeExecuteHooksForFactory', () => {
    it('should encode execute hooks for factory correctly', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      adapterNames.forEach(async (adapterName) => {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)
        const ownerAddress = await adapter.signer.getAddress()

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const mockNonce = adapter.utils.formatBytes32String('1')
        const mockDeadline = BigInt(1000000)
        const mockSignature = '0xdeadbeef'
        const calls = createCallsForAdapter(adapter)

        const result = cowShed.encodeExecuteHooksForFactory(calls, mockNonce, mockDeadline, ownerAddress, mockSignature)

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.startsWith('0x')).toBe(true)
      })
    })
  })

  describe('verifyEip1271Signature', () => {
    it('should return true for smart contract with valid EIP1271 signature', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)
        clearAllCowShedHooksCaches() // Clear cache for each adapter iteration

        // Mock readContract to return EIP1271_MAGICVALUE
        const originalReadContract = adapter.readContract
        adapter.readContract = jest.fn().mockResolvedValue('0x1626ba7e')

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const calls = createCallsForAdapter(adapter)
        const nonce = adapter.utils.formatBytes32String('1')
        const deadline = BigInt(1000000)
        const proxy = cowShed.proxyOf(USER_MOCK)
        const typedDataContext = cowShed.infoToSign(calls, nonce, deadline, proxy)
        const signature = '0x1234abcd'

        const result = await cowShed.verifyEip1271Signature(USER_MOCK, signature, typedDataContext)

        expect(result).toBe(true)
        expect(adapter.readContract).toHaveBeenCalledWith({
          address: USER_MOCK,
          abi: expect.any(Array),
          functionName: 'isValidSignature',
          args: [expect.any(String), signature],
        })

        // Restore original method
        adapter.readContract = originalReadContract
      }
    })

    it('should return false for smart contract with invalid EIP1271 signature', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)
        clearAllCowShedHooksCaches() // Clear cache for each adapter iteration

        // Mock readContract to return invalid magic value
        const originalReadContract = adapter.readContract
        adapter.readContract = jest.fn().mockResolvedValue('0xffffffff')

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const calls = createCallsForAdapter(adapter)
        const nonce = adapter.utils.formatBytes32String('1')
        const deadline = BigInt(1000000)
        const proxy = cowShed.proxyOf(USER_MOCK)
        const typedDataContext = cowShed.infoToSign(calls, nonce, deadline, proxy)
        const signature = '0x1234abcd'

        const result = await cowShed.verifyEip1271Signature(USER_MOCK, signature, typedDataContext)

        expect(result).toBe(false)
        expect(adapter.readContract).toHaveBeenCalledWith({
          address: USER_MOCK,
          abi: expect.any(Array),
          functionName: 'isValidSignature',
          args: [expect.any(String), signature],
        })

        // Restore original method
        adapter.readContract = originalReadContract
      }
    })

    it('should use correct EIP1271 ABI and hash typed data correctly', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)
        clearAllCowShedHooksCaches() // Clear cache for each adapter iteration

        // Mock readContract to return EIP1271_MAGICVALUE
        const originalReadContract = adapter.readContract
        const originalHashTypedData = adapter.utils.hashTypedData
        adapter.readContract = jest.fn().mockResolvedValue('0x1626ba7e')
        adapter.utils.hashTypedData = jest.fn().mockReturnValue('0x1234567890abcdef')

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const calls = createCallsForAdapter(adapter)
        const nonce = adapter.utils.formatBytes32String('1')
        const deadline = BigInt(1000000)
        const proxy = cowShed.proxyOf(USER_MOCK)
        const typedDataContext = cowShed.infoToSign(calls, nonce, deadline, proxy)
        const signature = '0x1234abcd'

        await cowShed.verifyEip1271Signature(USER_MOCK, signature, typedDataContext)

        // Verify hashTypedData was called with correct parameters
        expect(adapter.utils.hashTypedData).toHaveBeenCalledWith(
          typedDataContext.domain,
          typedDataContext.types,
          typedDataContext.message,
        )

        // Verify readContract was called with the correct ABI
        const readContractCall = (adapter.readContract as jest.Mock).mock.calls[0][0]
        expect(readContractCall.abi).toEqual([
          {
            inputs: [
              { internalType: 'bytes32', name: '_hash', type: 'bytes32' },
              { internalType: 'bytes', name: 'signature', type: 'bytes' },
            ],
            name: 'isValidSignature',
            outputs: [{ internalType: 'bytes4', name: 'magic', type: 'bytes4' }],
            stateMutability: 'view',
            type: 'function',
          },
        ])

        // Restore original methods
        adapter.readContract = originalReadContract
        adapter.utils.hashTypedData = originalHashTypedData
      }
    })

    it('should return false when contract call fails', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)
        clearAllCowShedHooksCaches() // Clear cache for each adapter iteration

        // Mock readContract to throw an error
        const originalReadContract = adapter.readContract
        const originalConsoleError = console.error
        adapter.readContract = jest.fn().mockRejectedValue(new Error('Contract call failed'))
        console.error = jest.fn() // Mock console.error to avoid noise in test output

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const calls = createCallsForAdapter(adapter)
        const nonce = adapter.utils.formatBytes32String('1')
        const deadline = BigInt(1000000)
        const proxy = cowShed.proxyOf(USER_MOCK)
        const typedDataContext = cowShed.infoToSign(calls, nonce, deadline, proxy)
        const signature = '0x1234abcd'

        // Should return false when contract call fails
        const result = await cowShed.verifyEip1271Signature(USER_MOCK, signature, typedDataContext)

        expect(result).toBe(false)
        expect(console.error).toHaveBeenCalledWith('CoWShedHooks.verifyEip1271Signature', expect.any(Error))

        // Restore original methods
        adapter.readContract = originalReadContract
        console.error = originalConsoleError
      }
    })
  })

  describe('doesAccountHaveCode', () => {
    it('should return false for EOA accounts', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)
        clearAllCowShedHooksCaches() // Clear cache for each adapter iteration

        // Mock getCode to return '0x' for EOA
        const originalGetCode = adapter.getCode
        adapter.getCode = jest.fn().mockResolvedValue('0x')

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        // Access private method via reflection for testing
        const result = await (cowShed as any).doesAccountHaveCode(USER_MOCK)

        expect(result).toBe(false)
        expect(adapter.getCode).toHaveBeenCalledWith(USER_MOCK)

        // Restore original method
        adapter.getCode = originalGetCode
      }
    })

    it('should return true for smart contract accounts', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)
        clearAllCowShedHooksCaches() // Clear cache for each adapter iteration

        // Mock getCode to return bytecode (indicating smart contract)
        const originalGetCode = adapter.getCode
        adapter.getCode = jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50')

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        // Access private method via reflection for testing
        const result = await (cowShed as any).doesAccountHaveCode(USER_MOCK)

        expect(result).toBe(true)
        expect(adapter.getCode).toHaveBeenCalledWith(USER_MOCK)

        // Restore original method
        adapter.getCode = originalGetCode
      }
    })
  })

  describe('signCalls', () => {
    const signatures: string[] = []
    it('should sign calls correctly for EOA accounts (no EIP1271 validation)', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        // Mock getCode to return '0x' for EOA (no contract code)
        const originalGetCode = adapter.getCode
        adapter.getCode = jest.fn().mockResolvedValue('0x')

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const mockNonce = adapter.utils.formatBytes32String('1')
        const mockDeadline = BigInt(1000000)
        const calls = createCallsForAdapter(adapter)

        const signature = await cowShed.signCalls(calls, mockNonce, mockDeadline, SigningScheme.EIP712, adapter.signer)
        const signatureWithoutSigner = await cowShed.signCalls(
          calls,
          mockNonce,
          mockDeadline,
          SigningScheme.EIP712,
          undefined,
        )

        expect(signature).toBeDefined()
        expect(typeof signature).toBe('string')
        expect(signature.startsWith('0x')).toBe(true)
        expect(signature.length).toBeGreaterThan(130) // Should be at least r + s + v length

        expect(signatureWithoutSigner).toBeDefined()
        expect(typeof signatureWithoutSigner).toBe('string')
        expect(signatureWithoutSigner.startsWith('0x')).toBe(true)
        expect(signatureWithoutSigner.length).toBeGreaterThan(130) // Should be at least r + s + v length

        signatures.push(signature)

        // Restore original method
        adapter.getCode = originalGetCode
      }
      expect(signatures[0]).toBe(signatures[1])
      expect(signatures[0]).toBe(signatures[2])
    })

    it('should sign calls correctly for smart contract accounts with valid EIP1271 signature', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        // Clear caches to ensure clean state for each adapter test
        clearAllCowShedHooksCaches()

        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        // Mock getCode to return bytecode (indicating smart contract)
        // Mock readContract to return EIP1271_MAGICVALUE
        const originalGetCode = adapter.getCode
        const originalReadContract = adapter.readContract
        adapter.getCode = jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50')
        adapter.readContract = jest.fn().mockResolvedValue('0x1626ba7e')

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const mockNonce = adapter.utils.formatBytes32String('1')
        const mockDeadline = BigInt(1000000)
        const calls = createCallsForAdapter(adapter)

        const signature = await cowShed.signCalls(calls, mockNonce, mockDeadline, SigningScheme.EIP712, adapter.signer)

        expect(signature).toBeDefined()
        expect(typeof signature).toBe('string')
        expect(signature.startsWith('0x')).toBe(true)
        expect(signature.length).toBeGreaterThan(130) // Should be at least r + s + v length

        // Verify that EIP1271 validation was called
        expect(adapter.readContract).toHaveBeenCalled()

        // Restore original methods
        adapter.getCode = originalGetCode
        adapter.readContract = originalReadContract
      }
    })

    it('should throw CoWShedEip1271SignatureInvalid for smart contract with invalid EIP1271 signature', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        // Mock getCode to return bytecode (indicating smart contract)
        // Mock readContract to return invalid magic value
        const originalGetCode = adapter.getCode
        const originalReadContract = adapter.readContract
        adapter.getCode = jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50')
        adapter.readContract = jest.fn().mockResolvedValue('0xffffffff')

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const mockNonce = adapter.utils.formatBytes32String('1')
        const mockDeadline = BigInt(1000000)
        const calls = createCallsForAdapter(adapter)

        // Should throw CoWShedEip1271SignatureInvalid
        await expect(
          cowShed.signCalls(calls, mockNonce, mockDeadline, SigningScheme.EIP712, adapter.signer),
        ).rejects.toThrow('EIP1271 signature is invalid for CoW Shed')

        // Restore original methods
        adapter.getCode = originalGetCode
        adapter.readContract = originalReadContract
      }
    })

    it('should not validate EIP1271 signature for non-EIP712 signing schemes', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        // Mock getCode to return bytecode (indicating smart contract)
        const originalGetCode = adapter.getCode
        const originalReadContract = adapter.readContract
        adapter.getCode = jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50')
        adapter.readContract = jest.fn()

        const cowShed = new CowShedHooks(1, {
          factoryAddress: MOCK_COW_SHED_FACTORY,
          implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
          proxyCreationCode: MOCK_INIT_CODE,
        })

        const mockNonce = adapter.utils.formatBytes32String('1')
        const mockDeadline = BigInt(1000000)
        const calls = createCallsForAdapter(adapter)

        // Use ETHSIGN instead of EIP712
        const signature = await cowShed.signCalls(calls, mockNonce, mockDeadline, SigningScheme.ETHSIGN, adapter.signer)

        expect(signature).toBeDefined()
        // Should not have called readContract for EIP1271 validation
        expect(adapter.readContract).not.toHaveBeenCalled()

        // Restore original methods
        adapter.getCode = originalGetCode
        adapter.readContract = originalReadContract
      }
    })
  })

  describe('Caching', () => {
    beforeEach(() => {
      // Clear shared caches before each test
      clearAllCowShedHooksCaches()
    })

    describe('doesAccountHaveCode caching', () => {
      it('should cache account code check results', async () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          const adapter = adapters[adapterName]
          setGlobalAdapter(adapter)
          clearAllCowShedHooksCaches() // Clear cache for each adapter test

          // Mock getCode to track calls
          const originalGetCode = adapter.getCode
          const getCodeSpy = jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50')
          adapter.getCode = getCodeSpy

          const cowShed = new CowShedHooks(1, {
            factoryAddress: MOCK_COW_SHED_FACTORY,
            implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
            proxyCreationCode: MOCK_INIT_CODE,
          })

          const testAccount = '0x1234567890123456789012345678901234567890'

          // First call should hit the network
          const result1 = await (cowShed as any).doesAccountHaveCode(testAccount)
          expect(result1).toBe(true)
          expect(getCodeSpy).toHaveBeenCalledTimes(1)

          // Second call should use cache
          const result2 = await (cowShed as any).doesAccountHaveCode(testAccount)
          expect(result2).toBe(true)
          expect(getCodeSpy).toHaveBeenCalledTimes(1) // Still 1, not 2

          // Third call should also use cache
          const result3 = await (cowShed as any).doesAccountHaveCode(testAccount)
          expect(result3).toBe(true)
          expect(getCodeSpy).toHaveBeenCalledTimes(1) // Still 1, not 3

          // Different account should hit the network again
          const testAccount2 = '0x9876543210987654321098765432109876543210'
          const result4 = await (cowShed as any).doesAccountHaveCode(testAccount2)
          expect(result4).toBe(true)
          expect(getCodeSpy).toHaveBeenCalledTimes(2) // Now 2

          // Restore original method
          adapter.getCode = originalGetCode
        }
      })

      it('should cache different results for different accounts', async () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          const adapter = adapters[adapterName]
          setGlobalAdapter(adapter)
          clearAllCowShedHooksCaches() // Clear cache for each adapter test

          // Mock getCode to return different values based on account
          const originalGetCode = adapter.getCode
          const getCodeSpy = jest.fn().mockImplementation((account: string) => {
            if (account === '0x1111111111111111111111111111111111111111') {
              return Promise.resolve('0x608060405234801561001057600080fd5b50') // Has code
            }
            return Promise.resolve('0x') // No code
          })
          adapter.getCode = getCodeSpy

          const cowShed = new CowShedHooks(1, {
            factoryAddress: MOCK_COW_SHED_FACTORY,
            implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
            proxyCreationCode: MOCK_INIT_CODE,
          })

          const contractAccount = '0x1111111111111111111111111111111111111111'
          const eoaAccount = '0x2222222222222222222222222222222222222222'

          // Check contract account
          const result1 = await (cowShed as any).doesAccountHaveCode(contractAccount)
          expect(result1).toBe(true)
          expect(getCodeSpy).toHaveBeenCalledTimes(1)

          // Check EOA account
          const result2 = await (cowShed as any).doesAccountHaveCode(eoaAccount)
          expect(result2).toBe(false)
          expect(getCodeSpy).toHaveBeenCalledTimes(2)

          // Check contract account again - should use cache
          const result3 = await (cowShed as any).doesAccountHaveCode(contractAccount)
          expect(result3).toBe(true)
          expect(getCodeSpy).toHaveBeenCalledTimes(2) // Still 2

          // Check EOA account again - should use cache
          const result4 = await (cowShed as any).doesAccountHaveCode(eoaAccount)
          expect(result4).toBe(false)
          expect(getCodeSpy).toHaveBeenCalledTimes(2) // Still 2

          // Restore original method
          adapter.getCode = originalGetCode
        }
      })
    })

    describe('verifyEip1271Signature caching', () => {
      it('should cache EIP1271 signature verification results', async () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          const adapter = adapters[adapterName]
          setGlobalAdapter(adapter)
          clearAllCowShedHooksCaches() // Clear cache for each adapter test

          // Mock readContract to track calls
          const originalReadContract = adapter.readContract
          const readContractSpy = jest.fn().mockResolvedValue('0x1626ba7e') // EIP1271_MAGICVALUE
          adapter.readContract = readContractSpy

          const cowShed = new CowShedHooks(1, {
            factoryAddress: MOCK_COW_SHED_FACTORY,
            implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
            proxyCreationCode: MOCK_INIT_CODE,
          })

          const calls = createCallsForAdapter(adapter)
          const nonce = adapter.utils.formatBytes32String('1')
          const deadline = BigInt(1000000)
          const proxy = cowShed.proxyOf(USER_MOCK)
          const typedDataContext = cowShed.infoToSign(calls, nonce, deadline, proxy)
          const signature = '0x1234abcd'
          const account = '0x1234567890123456789012345678901234567890'

          // First call should hit the network
          const result1 = await cowShed.verifyEip1271Signature(account, signature, typedDataContext)
          expect(result1).toBe(true)
          expect(readContractSpy).toHaveBeenCalledTimes(1)

          // Second call with same parameters should use cache
          const result2 = await cowShed.verifyEip1271Signature(account, signature, typedDataContext)
          expect(result2).toBe(true)
          expect(readContractSpy).toHaveBeenCalledTimes(1) // Still 1, not 2

          // Third call should also use cache
          const result3 = await cowShed.verifyEip1271Signature(account, signature, typedDataContext)
          expect(result3).toBe(true)
          expect(readContractSpy).toHaveBeenCalledTimes(1) // Still 1, not 3

          // Different signature should hit the network again
          const differentSignature = '0xdeadbeef'
          const result4 = await cowShed.verifyEip1271Signature(account, differentSignature, typedDataContext)
          expect(result4).toBe(true)
          expect(readContractSpy).toHaveBeenCalledTimes(2) // Now 2

          // Restore original method
          adapter.readContract = originalReadContract
        }
      })

      it('should not cache failed EIP1271 signature verification results', async () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          const adapter = adapters[adapterName]
          setGlobalAdapter(adapter)
          clearAllCowShedHooksCaches() // Clear cache for each adapter test

          // Mock readContract to throw error
          const originalReadContract = adapter.readContract
          const originalConsoleError = console.error
          const readContractSpy = jest.fn().mockRejectedValue(new Error('Contract call failed'))
          adapter.readContract = readContractSpy
          console.error = jest.fn() // Mock to avoid test noise

          const cowShed = new CowShedHooks(1, {
            factoryAddress: MOCK_COW_SHED_FACTORY,
            implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
            proxyCreationCode: MOCK_INIT_CODE,
          })

          const calls = createCallsForAdapter(adapter)
          const nonce = adapter.utils.formatBytes32String('1')
          const deadline = BigInt(1000000)
          const proxy = cowShed.proxyOf(USER_MOCK)
          const typedDataContext = cowShed.infoToSign(calls, nonce, deadline, proxy)
          const signature = '0x1234abcd'
          const account = '0x1234567890123456789012345678901234567890'

          // First call should hit the network and fail
          const result1 = await cowShed.verifyEip1271Signature(account, signature, typedDataContext)
          expect(result1).toBe(false)
          expect(readContractSpy).toHaveBeenCalledTimes(1)

          // Second call should also hit the network (failures are not cached)
          const result2 = await cowShed.verifyEip1271Signature(account, signature, typedDataContext)
          expect(result2).toBe(false)
          expect(readContractSpy).toHaveBeenCalledTimes(2) // Should be 2, not 1

          // Restore original methods
          adapter.readContract = originalReadContract
          console.error = originalConsoleError
        }
      })

      it('should create different cache keys for different parameters', async () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          const adapter = adapters[adapterName]
          setGlobalAdapter(adapter)
          clearAllCowShedHooksCaches() // Clear cache for each adapter test

          // Mock readContract to track calls
          const originalReadContract = adapter.readContract
          const readContractSpy = jest.fn().mockResolvedValue('0x1626ba7e')
          adapter.readContract = readContractSpy

          const cowShed = new CowShedHooks(1, {
            factoryAddress: MOCK_COW_SHED_FACTORY,
            implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
            proxyCreationCode: MOCK_INIT_CODE,
          })

          const calls = createCallsForAdapter(adapter)
          const nonce = adapter.utils.formatBytes32String('1')
          const deadline = BigInt(1000000)
          const proxy = cowShed.proxyOf(USER_MOCK)
          const typedDataContext = cowShed.infoToSign(calls, nonce, deadline, proxy)

          const account1 = '0x1111111111111111111111111111111111111111'
          const account2 = '0x2222222222222222222222222222222222222222'
          const signature1 = '0x1234abcd'
          const signature2 = '0xdeadbeef'

          // Different accounts should create different cache entries
          await cowShed.verifyEip1271Signature(account1, signature1, typedDataContext)
          expect(readContractSpy).toHaveBeenCalledTimes(1)

          await cowShed.verifyEip1271Signature(account2, signature1, typedDataContext)
          expect(readContractSpy).toHaveBeenCalledTimes(2)

          // Different signatures should create different cache entries
          await cowShed.verifyEip1271Signature(account1, signature2, typedDataContext)
          expect(readContractSpy).toHaveBeenCalledTimes(3)

          // Same parameters should use cache
          await cowShed.verifyEip1271Signature(account1, signature1, typedDataContext)
          expect(readContractSpy).toHaveBeenCalledTimes(3) // Still 3

          // Restore original method
          adapter.readContract = originalReadContract
        }
      })
    })
  })
})
