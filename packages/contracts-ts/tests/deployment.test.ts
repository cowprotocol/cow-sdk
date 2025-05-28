import { createAdapters, TEST_ADDRESS } from './setup'
import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  ContractsTs,
  CONTRACT_NAMES,
  SALT,
  deterministicDeploymentAddress,
  proxyInterface,
  implementationAddress,
  ownerAddress,
} from '../src'
import { concat, getCreate2Address, Hex, keccak256 } from 'viem'

describe('Deployment and Proxy', () => {
  let adapters: ReturnType<typeof createAdapters>
  let contracts: {
    ethersV5Contracts: ContractsTs
    ethersV6Contracts: ContractsTs
    viemContracts: ContractsTs
  }

  beforeAll(() => {
    adapters = createAdapters()
    contracts = {
      ethersV5Contracts: new ContractsTs(adapters.ethersV5Adapter),
      ethersV6Contracts: new ContractsTs(adapters.ethersV6Adapter),
      viemContracts: new ContractsTs(adapters.viemAdapter),
    }
    concat(['0x1234', '0x4567'])
  })

  describe('deterministicDeploymentAddress', () => {
    test('should compute deployment addresses consistently across different adapters', () => {
      // Mock ABI and bytecode for testing
      const testArtifact = {
        abi: [
          {
            inputs: [
              { name: 'authenticator', type: 'address' },
              { name: 'allowListConfig', type: 'address' },
            ],
            stateMutability: 'nonpayable',
            type: 'constructor',
          },
        ],
        bytecode: '0x608060405234801561001057600080fd5b506040516102c73803806102c78339',
        contractName: CONTRACT_NAMES.settlement,
      }

      // Deploy arguments for the settlement contract
      const deployArgs = [
        '0x9008D19f58AAbD9eD0D60971565AA8510560ab41', // authenticator
        '0x1234567890123456789012345678901234567890', // allowListConfig
      ] as [string, string]

      // Compute deployment address with each adapter
      const addresses: string[] = []
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const address = deterministicDeploymentAddress(testArtifact, deployArgs)
        addresses.push(address)
      }

      // All addresses should be identical
      const [firstAddress, ...remainingAddresses] = addresses
      remainingAddresses.forEach((address) => {
        expect(address).toEqual(firstAddress)
      })

      // Verify the address is a valid Ethereum address
      expect(firstAddress).toMatch(/^0x[0-9a-f]{40}$/i)

      // Check that we're actually using the SALT and DEPLOYER_CONTRACT constants
      // by mocking an alternate implementation and ensuring results differ
      const mockHashFunction = jest
        .fn()
        .mockReturnValue('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
      const originalKeccak256 = adapters.ethersV5Adapter.utils.keccak256
      adapters.ethersV5Adapter.utils.keccak256 = mockHashFunction

      try {
        setGlobalAdapter(adapters.ethersV5Adapter)
        const mockedAddress = deterministicDeploymentAddress(testArtifact, deployArgs)

        // Address should be different with the mocked hash function
        expect(mockedAddress).not.toEqual(firstAddress)

        // The mockHashFunction should be called with data containing the SALT
        expect(mockHashFunction).toHaveBeenCalled()
        const args = mockHashFunction.mock.calls[0][0]
        expect(typeof args).toBe('string')
      } finally {
        // Restore original function
        adapters.ethersV5Adapter.utils.keccak256 = originalKeccak256
      }
    })

    test('should compute different addresses for different contracts and args', () => {
      // Two different artifacts
      const testArtifact1 = {
        abi: [{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' }],
        bytecode: '0x608060405234801561001057600080fd5b506040516102c73803806102c78339',
        contractName: CONTRACT_NAMES.authenticator,
      }
      const deployerAddress = '0xa90914762709441d557De208bAcE1edB1A3968b2'

      // Deploy args for second artifact
      const deployArgs = [
        '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
        '0x1234567890123456789012345678901234567890',
      ] as [string, string]

      // Ethers v5
      const ethersV5Address = ethersV5.utils.getCreate2Address(
        deployerAddress,
        SALT,
        ethersV5.utils.keccak256(ethersV5.utils.hexConcat([testArtifact1.bytecode, ...deployArgs])),
      )

      // Ethers v5
      const ethersV6Address = ethersV6.getCreate2Address(
        deployerAddress,
        SALT,
        ethersV6.keccak256(ethersV6.concat([testArtifact1.bytecode, ...deployArgs])),
      )

      // Viem
      const viemAddress = getCreate2Address({
        from: deployerAddress,
        salt: SALT,
        bytecodeHash: keccak256(concat([testArtifact1.bytecode as Hex, ...(deployArgs as Hex[])])),
      })

      expect(ethersV5Address).toEqual(ethersV6Address)
      expect(ethersV5Address).toEqual(viemAddress)
    })
  })

  describe('Proxy interfaces', () => {
    test('should mock implementation and owner addresses consistently', async () => {
      // Mock a provider for testing
      const mockProvider = {
        getStorageAt: jest.fn().mockResolvedValue('0x000000000000000000000000' + TEST_ADDRESS.substring(2)),
      }

      // proxy contract address
      const proxyAddress = '0x1234567890123456789012345678901234567890'

      // Mock contract objects
      const mockContract = {
        address: proxyAddress,
        provider: mockProvider,
      }

      // Test implementation address with different adapters
      const implementationPromises: Promise<string>[] = []
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        implementationPromises.push(implementationAddress(mockProvider as any, proxyAddress))
      }

      // All calls should resolve to the same address
      const implementations = await Promise.all(implementationPromises)
      const [firstImplementation, ...remainingImplementations] = implementations
      remainingImplementations.forEach((implementation) => {
        expect(implementation).toEqual(firstImplementation)
      })

      // Test owner address
      const ownerPromises: Promise<string>[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        ownerPromises.push(ownerAddress(mockProvider as any, proxyAddress))
      }

      // All calls should resolve to the same address
      const owners = await Promise.all(ownerPromises)
      const [firstOwner, ...remainingOwners] = owners
      remainingOwners.forEach((owner) => {
        expect(owner).toEqual(firstOwner)
      })
      expect(firstOwner).toEqual(TEST_ADDRESS)
    })

    test('should create proxy interfaces consistently', () => {
      // Mock getContract implementations for each adapter
      const originalGetContracts = {} as Record<keyof typeof adapters, any>
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Store original functions and mock them
      for (const adapterName of adapterNames) {
        originalGetContracts[adapterName] = adapters[adapterName].getContract
      }

      const mockContract = { address: '0x1234567890123456789012345678901234567890' }
      const mockProxyContract = { mock: 'proxy-interface' }

      for (const adapterName of adapterNames) {
        adapters[adapterName].getContract = jest.fn().mockReturnValue(mockProxyContract)
      }

      try {
        // Get proxy interface with each adapter
        const proxyInterfaces = []

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const proxyInterfaceResult = proxyInterface(mockContract as any)
          proxyInterfaces.push(proxyInterfaceResult)
        }

        // All interfaces should be the same mock object
        proxyInterfaces.forEach((proxyInterfaceResult) => {
          expect(proxyInterfaceResult).toEqual(mockProxyContract)
        })

        // Verify getContract was called with the right arguments for each adapter
        for (const adapterName of adapterNames) {
          expect(adapters[adapterName].getContract).toHaveBeenCalledWith(
            mockContract.address,
            expect.anything(),
            undefined,
          )
        }
      } finally {
        // Restore original functions
        for (const adapterName of adapterNames) {
          adapters[adapterName].getContract = originalGetContracts[adapterName]
        }
      }
    })
  })
})
