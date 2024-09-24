import { Wallet } from 'ethers'
import { CowShedHooks } from './CoWShedHooks'
import { AddressZero } from '@ethersproject/constants'
import { ICoWShedCall } from './types'
import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION } from '../common/consts'
import { COW_SHED_PROXY_INIT_CODE } from './proxyInitCode'
import { SigningScheme } from '@cowprotocol/contracts'
import { formatBytes32String, solidityPack } from 'ethers/lib/utils'
import * as contracts from './contracts'

// information from mint and dai example of cow-shed repository
// https://github.com/cowdao-grants/cow-shed/blob/main/examples/mintDaiAndSwap.ts
const MOCK_COW_SHED_FACTORY = '0xa9efDEf197130B945462163a0B852019BA529a66'
const MOCK_COW_SHED_IMPLEMENTATION = '0x49AeF2C4005Bf572665b09014A563B5b9E46Df21'
const MOCK_INIT_CODE =
  '0x60a034608e57601f61037138819003918201601f19168301916001600160401b038311848410176093578084926040948552833981010312608e57604b602060458360a9565b920160a9565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc556040516102b490816100bd8239608051818181608f01526101720152f35b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b0382168203608e5756fe60806040526004361015610018575b3661019457610194565b6000803560e01c908163025b22bc1461003b575063f851a4400361000e5761010d565b3461010a5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261010a5773ffffffffffffffffffffffffffffffffffffffff60043581811691828203610106577f0000000000000000000000000000000000000000000000000000000000000000163314600014610101577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b8280a280f35b61023d565b8380fd5b80fd5b346101645760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc360112610164576020610146610169565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b600080fd5b333003610101577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101ef575b1561023d5760046040517ff92ee8a9000000000000000000000000000000000000000000000000000000008152fd5b507f400ada75000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000006000351614156101c0565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546000808092368280378136915af43d82803e1561027a573d90f35b3d90fdfea2646970667358221220c7c26ff3040b96a28e96d6d27b743972943aeaef81cc821544c5fe1e24f9b17264736f6c63430008190033'

const USER_MOCK = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const PROXY_MOCK = '0xB34c56557a1ec3617572C6cDd814A1a9F9A20A51'

const CALLS_MOCK: ICoWShedCall[] = [
  {
    target: AddressZero,
    value: BigInt(0),
    callData: '0xabcdef',
    allowFailure: false,
    isDelegateCall: false,
  },
]

describe('CowShedHooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const cowShed = new CowShedHooks(1, {
    factoryAddress: MOCK_COW_SHED_FACTORY,
    implementationAddress: MOCK_COW_SHED_IMPLEMENTATION,
    proxyCreationCode: MOCK_INIT_CODE,
  })

  describe('constuctor', () => {
    it('should create a new instance of CowShedHooks with custom values', () => {
      expect(cowShed).toBeInstanceOf(CowShedHooks)
      expect(cowShed.getFactoryAddress()).toBe(MOCK_COW_SHED_FACTORY)
      expect(cowShed.getImplementationAddress()).toBe(MOCK_COW_SHED_IMPLEMENTATION)
      expect(cowShed.proxyCreationCode()).toBe(MOCK_INIT_CODE)
    })

    it('should create a new instance of CowShedHooks with default values', () => {
      const defaultCowShed = new CowShedHooks(1)
      expect(defaultCowShed).toBeInstanceOf(CowShedHooks)
      expect(defaultCowShed.getFactoryAddress()).toBe(COW_SHED_FACTORY)
      expect(defaultCowShed.getImplementationAddress()).toBe(COW_SHED_IMPLEMENTATION)
      expect(defaultCowShed.proxyCreationCode()).toBe(COW_SHED_PROXY_INIT_CODE)
    })
  })

  describe('computeProxyAddress', () => {
    it('should use the right parameters on the proxy address for custom values', () => {
      const calculatedProxy = cowShed.proxyOf(USER_MOCK)
      expect(calculatedProxy).toBe(PROXY_MOCK)
    })

    it('should use the right parameters on the proxy address for default values', () => {
      const defaultCowShed = new CowShedHooks(1)
      const calculatedProxy = defaultCowShed.proxyOf('0x76b0340e50BD9883D8B2CA5fd9f52439a9e7Cf58')
      expect(calculatedProxy).toBe('0xe22E86b318DAc817b4444E2fE34cC2235cDF1B00')
    })
  })

  describe('getDomain', () => {
    it('should return the correct domain', () => {
      const domain = cowShed.getDomain(AddressZero)
      expect(domain).toEqual({
        name: 'COWShed',
        version: '1.0.0',
        chainId: 1,
        verifyingContract: AddressZero,
      })
    })
  })

  describe('infoToSign', () => {
    it('should return the correct info to sign', () => {
      const calls: ICoWShedCall[] = [
        {
          target: '0x1234',
          value: BigInt(100),
          callData: '0x1234',
          allowFailure: false,
          isDelegateCall: false,
        },
      ]
      const nonce = '1'
      const deadline = BigInt(1000000)
      const result = cowShed.infoToSign(calls, nonce, deadline, PROXY_MOCK)
      expect(result).toHaveProperty('domain')
      expect(result).toHaveProperty('types')
      expect(result).toHaveProperty('message')
      expect(result.message).toEqual({ calls, nonce, deadline })
    })
  })

  const mockNonce = formatBytes32String('1')
  const mockDeadline = BigInt(1000000)
  describe('encodeExecuteHooksForFactory', () => {
    it('should encode execute hooks for factory correctly', () => {
      const mockSignature = '0xdeadbeef'
      const mockEncodedData = '0xencoded'

      const mockEncodeFunctionData = jest.fn().mockReturnValue(mockEncodedData)
      const mockInterface = {
        encodeFunctionData: mockEncodeFunctionData,
      }

      jest.spyOn(contracts, 'getCoWShedFactoryInterface').mockReturnValue(mockInterface)

      const result = cowShed.encodeExecuteHooksForFactory(CALLS_MOCK, mockNonce, mockDeadline, USER_MOCK, mockSignature)

      expect(mockEncodeFunctionData).toHaveBeenCalledWith('executeHooks', [
        CALLS_MOCK,
        mockNonce,
        mockDeadline,
        USER_MOCK,
        mockSignature,
      ])

      expect(result).toBe(mockEncodedData)
    })
  })

  describe('signCalls', () => {
    it('should sign calls correctly', async () => {
      const mockSigner = Wallet.createRandom()

      const signature = await cowShed.signCalls(CALLS_MOCK, mockNonce, mockDeadline, mockSigner, SigningScheme.EIP712)
      expect(signature).toBeDefined()
      const r = BigInt(signature.slice(0, 66))
      const s = BigInt(`0x${signature.slice(66, 130)}`)
      const v = parseInt(signature.slice(130, 132), 16)
      const reconstructedSignature = solidityPack(['uint', 'uint', 'uint8'], [r, s, v])
      expect(reconstructedSignature).toBe(signature)
    })
  })
})
