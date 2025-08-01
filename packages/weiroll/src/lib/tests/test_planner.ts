/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Contract, Planner } from '../planner'
import * as mathABI from '../abis/Math.json'
import * as stringsABI from '../abis/Strings.json'
import { createSpecificAdapters, TEST_ADDRESS } from '../../../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ethers } from 'ethers-v5'
import { hexDataSlice, hexConcat } from 'ethers-v5/lib/utils'
import { CommandFlags } from '../planner'

const { defaultAbiCoder } = ethers.utils

const adapterNames = ['ethersV5Adapter', 'ethersV6Adapter', 'viemAdapter'] as const
const adapters = createSpecificAdapters(adapterNames as unknown as string[])

const mathContracts: { [key: string]: Contract } = {}
const stringsContracts: { [key: string]: Contract } = {}

for (const adapterName of adapterNames) {
  const adapter = adapters[adapterName]!
  setGlobalAdapter(adapter)
  const contract = adapter.getContract(TEST_ADDRESS, mathABI.abi as any)
  mathContracts[adapterName] = Contract.createLibrary(contract)
  stringsContracts[adapterName] = Contract.createLibrary(new ethers.Contract(TEST_ADDRESS, stringsABI.abi))
}

describe('Contract', () => {
  it('wraps contract objects and exposes their functions', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]
      if (!adapter) continue
      setGlobalAdapter(adapter)
      const Math = mathContracts[adapterName]
      if (!Math) continue
      expect(Math?.add).not.toBeUndefined()
    }
  })

  it('returns a FunctionCall when contract functions are called', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Math = mathContracts[adapterName]!
      const result = Math.add(1, 2)

      expect(result.contract).toEqual(Math)
      expect(result.fragment).toEqual(Math.interface.getFunction('add'))

      const args = result.args
      expect(args.length).toEqual(2)
      expect(args[0].param).toEqual(Math.interface.getFunction('add').inputs[0])
      expect(args[0].value).toEqual(defaultAbiCoder.encode(['uint'], [1]))
      expect(args[1].param).toEqual(Math.interface.getFunction('add').inputs[1])
      expect(args[1].value).toEqual(defaultAbiCoder.encode(['uint'], [2]))
    }
  })
})

describe('Planner', () => {
  it('adds function calls to a list of commands', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Math = mathContracts[adapterName]!

      const planner = new Planner()
      const sum1 = planner.add(Math.add(1, 2))
      const sum2 = planner.add(Math.add(3, 4))
      planner.add(Math.add(sum1, sum2))
      expect(planner.commands.length).toEqual(3)
    }
  })

  it('plans a simple program', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Math = mathContracts[adapterName]!

      const planner = new Planner()
      planner.add(Math.add(1, 2))
      const { commands, state } = planner.plan()

      expect(commands.length).toBe(1)
      expect(commands[0]).toBe('0x771602f7000001ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')

      expect(state.length).toBe(2)
      expect(state[0]).toBe(defaultAbiCoder.encode(['uint'], [1]))
      expect(state[1]).toBe(defaultAbiCoder.encode(['uint'], [2]))
    }
  })

  it('deduplicates identical literals', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Math = mathContracts[adapterName]!

      const planner = new Planner()
      planner.add(Math.add(1, 1))
      const { state } = planner.plan()

      expect(state.length).toBe(1)
    }
  })

  it('plans a program that uses return values', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Math = mathContracts[adapterName]!

      const planner = new Planner()
      const sum1 = planner.add(Math.add(1, 2))
      planner.add(Math.add(sum1, 3))
      const { commands, state } = planner.plan()

      expect(commands.length).toBe(2)
      expect(commands[0]).toBe('0x771602f7000001ffffffff01ddb53511e1e322133d03d5c0b8a9555c4c9904d0')
      expect(commands[1]).toBe('0x771602f7000102ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')

      expect(state.length).toBe(3)
      expect(state[0]).toBe(defaultAbiCoder.encode(['uint'], [1]))
      expect(state[1]).toBe(defaultAbiCoder.encode(['uint'], [2]))
      expect(state[2]).toBe(defaultAbiCoder.encode(['uint'], [3]))
    }
  })

  it('plans a program that needs extra state slots for intermediate values', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Math = mathContracts[adapterName]!

      const planner = new Planner()
      const sum1 = planner.add(Math.add(1, 1))
      planner.add(Math.add(1, sum1))
      const { commands, state } = planner.plan()

      expect(commands.length).toBe(2)
      expect(commands[0]).toBe('0x771602f7000000ffffffff01ddb53511e1e322133d03d5c0b8a9555c4c9904d0')
      expect(commands[1]).toBe('0x771602f7000001ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')

      expect(state.length).toBe(2)
      expect(state[0]).toBe(defaultAbiCoder.encode(['uint'], [1]))
      expect(state[1]).toBe('0x')
    }
  })

  it('plans a program that takes dynamic arguments', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Strings = stringsContracts[adapterName]!

      const planner = new Planner()
      planner.add(Strings.strlen('Hello, world!'))
      const { commands, state } = planner.plan()

      expect(commands.length).toBe(1)
      expect(commands[0]).toBe('0x367bbd780080ffffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')

      expect(state.length).toBe(1)
      expect(state[0]).toBe(hexDataSlice(defaultAbiCoder.encode(['string'], ['Hello, world!']), 32))
    }
  })

  it('plans a program that returns dynamic arguments', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Strings = stringsContracts[adapterName]!

      const planner = new Planner()
      planner.add(Strings.strcat('Hello, ', 'world!'))
      const { commands, state } = planner.plan()

      expect(commands.length).toBe(1)
      expect(commands[0]).toBe('0xd824ccf3008081ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')

      expect(state.length).toBe(2)
      expect(state[0]).toBe(hexDataSlice(defaultAbiCoder.encode(['string'], ['Hello, ']), 32))
      expect(state[1]).toBe(hexDataSlice(defaultAbiCoder.encode(['string'], ['world!']), 32))
    }
  })

  it('plans a program that takes a dynamic argument from a return value', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Strings = stringsContracts[adapterName]!

      const planner = new Planner()
      const str = planner.add(Strings.strcat('Hello, ', 'world!'))
      planner.add(Strings.strlen(str))
      const { commands, state } = planner.plan()

      expect(commands.length).toBe(2)
      expect(commands[0]).toBe('0xd824ccf3008081ffffffff81ddb53511e1e322133d03d5c0b8a9555c4c9904d0')
      expect(commands[1]).toBe('0x367bbd780081ffffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')

      expect(state.length).toBe(2)
      expect(state[0]).toBe(hexDataSlice(defaultAbiCoder.encode(['string'], ['Hello, ']), 32))
      expect(state[1]).toBe(hexDataSlice(defaultAbiCoder.encode(['string'], ['world!']), 32))
    }
  })

  it('requires argument counts to match the function definition', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)
      const Math = mathContracts[adapterName]!

      const planner = new Planner()
      expect(() => planner.add(Math.add(1))).toThrow()
    }
  })

  it('plans a call to a function that takes and replaces the current state', () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]!
      setGlobalAdapter(adapter)

      const TestContract = Contract.createLibrary(
        adapter.getContract(TEST_ADDRESS, ['function useState(bytes[] state) returns(bytes[])'] as any),
      )

      const planner = new Planner()
      planner.replaceState(TestContract.useState(planner.state))
      const { commands, state } = planner.plan()

      expect(commands.length).toBe(1)
      expect(commands[0]).toBe('0x08f389c800fefffffffffffeddb53511e1e322133d03d5c0b8a9555c4c9904d0')

      expect(state.length).toBe(0)
    }
  })

  describe('addSubplan()', () => {
    it('supports subplans', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const SubplanContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes[] state) returns(bytes[])' as any,
          ]),
        )

        const subplanner = new Planner()
        subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        planner.addSubplan(SubplanContract.execute(subplanner, subplanner.state))

        const { commands, state } = planner.plan()
        expect(commands).toEqual(['0xde792d5f0082fefffffffffeddb53511e1e322133d03d5c0b8a9555c4c9904d0'])

        expect(state.length).toBe(3)
        expect(state[0]).toBe(defaultAbiCoder.encode(['uint'], [1]))
        expect(state[1]).toBe(defaultAbiCoder.encode(['uint'], [2]))
        const subcommands = defaultAbiCoder.decode(
          ['bytes32[]'],
          hexConcat(['0x0000000000000000000000000000000000000000000000000000000000000020', state[2] as any]),
        )[0]
        expect(subcommands).toEqual(['0x771602f7000001ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0'])
      }
    })

    it('allows return value access in the parent scope', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const SubplanContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes[] state) returns(bytes[])' as any,
          ]),
        )

        const subplanner = new Planner()
        const sum = subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        planner.addSubplan(SubplanContract.execute(subplanner, subplanner.state))
        planner.add(Math.add(sum, 3))

        const { commands } = planner.plan()
        expect(commands).toEqual([
          // Invoke subplanner
          '0xde792d5f0083fefffffffffeddb53511e1e322133d03d5c0b8a9555c4c9904d0',
          // sum + 3
          '0x771602f7000102ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0',
        ])
      }
    })

    it('allows return value access across scopes', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const SubplanContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes[] state) returns(bytes[])' as any,
          ]),
        )

        const subplanner1 = new Planner()
        const sum = subplanner1.add(Math.add(1, 2))

        const subplanner2 = new Planner()
        subplanner2.add(Math.add(sum, 3))

        const planner = new Planner()
        planner.addSubplan(SubplanContract.execute(subplanner1, subplanner1.state))
        planner.addSubplan(SubplanContract.execute(subplanner2, subplanner2.state))

        const { commands, state } = planner.plan()
        expect(commands).toEqual([
          // Invoke subplanner1
          '0xde792d5f0083fefffffffffeddb53511e1e322133d03d5c0b8a9555c4c9904d0',
          // Invoke subplanner2
          '0xde792d5f0084fefffffffffeddb53511e1e322133d03d5c0b8a9555c4c9904d0',
        ])

        expect(state.length).toBe(5)
        const subcommands2 = defaultAbiCoder.decode(
          ['bytes32[]'],
          hexConcat(['0x0000000000000000000000000000000000000000000000000000000000000020', state[4] as any]),
        )[0]
        expect(subcommands2).toEqual([
          // sum + 3
          '0x771602f7000102ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0',
        ])
      }
    })

    it("doesn't allow return values to be referenced before they are defined", () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const subplanner = new Planner()
        const sum = subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        planner.add(Math.add(sum, 3))

        expect(() => planner.plan()).toThrow('Return value from "add" is not visible here')
      }
    })

    it('requires calls to addSubplan to have subplan and state args', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const SubplanContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes[] state) returns(bytes[])' as any,
          ]),
        )

        const subplanner = new Planner()
        subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        expect(() => planner.addSubplan(SubplanContract.execute(subplanner, []))).toThrow(
          'Subplans must take planner and state arguments',
        )
        expect(() => planner.addSubplan(SubplanContract.execute([], subplanner.state))).toThrow(
          'Subplans must take planner and state arguments',
        )
      }
    })

    it("doesn't allow more than one subplan per call", () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const MultiSubplanContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes32[] commands2, bytes[] state) returns(bytes[])' as any,
          ]),
        )

        const subplanner = new Planner()
        subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        expect(() =>
          planner.addSubplan(MultiSubplanContract.execute(subplanner, subplanner, subplanner.state)),
        ).toThrow('Subplans can only take one planner argument')
      }
    })

    it("doesn't allow more than one state array per call", () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const MultiStateContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes[] state, bytes[] state2) returns(bytes[])' as any,
          ]),
        )

        const subplanner = new Planner()
        subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        expect(() =>
          planner.addSubplan(MultiStateContract.execute(subplanner, subplanner.state, subplanner.state)),
        ).toThrow('Subplans can only take one state argument')
      }
    })

    it('requires subplan functions return bytes32[] or nothing', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const BadSubplanContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes[] state) returns(uint)' as any,
          ]),
        )

        const subplanner = new Planner()
        subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        expect(() => planner.addSubplan(BadSubplanContract.execute(subplanner, subplanner.state))).toThrow(
          'Subplans must return a bytes[] replacement state or nothing',
        )
      }
    })

    it('forbids infinite loops', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)

        const SubplanContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes[] state) returns(bytes[])' as any,
          ]),
        )

        const planner = new Planner()
        planner.addSubplan(SubplanContract.execute(planner, planner.state))
        expect(() => planner.plan()).toThrow('A planner cannot contain itself')
      }
    })

    it('allows for subplans without return values', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const ReadonlySubplanContract = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function execute(bytes32[] commands, bytes[] state) returns(bytes[])' as any,
          ]),
        )

        const subplanner = new Planner()
        subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        planner.addSubplan(ReadonlySubplanContract.execute(subplanner, subplanner.state))

        const { commands } = planner.plan()
        expect(commands).toEqual(['0xde792d5f0082fefffffffffeddb53511e1e322133d03d5c0b8a9555c4c9904d0'])
      }
    })

    it('does not allow return values from inside read-only subplans to be used outside them', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const ReadonlySubplanContract = Contract.createLibrary(
          new ethers.Contract(TEST_ADDRESS, ['function execute(bytes32[] commands, bytes[] state)']),
        )

        const subplanner = new Planner()
        const sum = subplanner.add(Math.add(1, 2))

        const planner = new Planner()
        planner.addSubplan(ReadonlySubplanContract.execute(subplanner, subplanner.state))
        planner.add(Math.add(sum, 3))

        expect(() => planner.plan()).toThrow('Return value from "add" is not visible here')
      }
    })

    it('plans CALLs', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        const planner = new Planner()
        planner.add(Math.add(1, 2))
        const { commands } = planner.plan()

        expect(commands.length).toBe(1)
        expect(commands[0]).toBe('0x771602f7000001ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')
      }
    })

    it('plans STATICCALLs', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)

        const Math = Contract.createContract(
          adapter.getContract(TEST_ADDRESS, mathABI.abi as any),
          CommandFlags.STATICCALL,
        )

        const planner = new Planner()
        planner.add(Math.add(1, 2))
        const { commands } = planner.plan()

        expect(commands.length).toBe(1)
        expect(commands[0]).toBe('0x771602f7020001ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')
      }
    })

    it('plans STATICCALLs via .staticcall()', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)

        const Math = Contract.createContract(adapter.getContract(TEST_ADDRESS, mathABI.abi as any), CommandFlags.CALL)

        const planner = new Planner()
        planner.add(Math.add(1, 2).staticcall())
        const { commands } = planner.plan()

        expect(commands.length).toBe(1)
        expect(commands[0]).toBe('0x771602f7020001ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')
      }
    })

    it('plans CALLs with value', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)

        const Test = Contract.createContract(
          adapter.getContract(TEST_ADDRESS, ['function deposit(uint x) payable' as any]),
        )

        const planner = new Planner()
        planner.add(Test.deposit(123).withValue(456))

        const { commands } = planner.plan()
        expect(commands.length).toBe(1)
        expect(commands[0]).toBe('0xb6b55f25030001ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0')
      }
    })

    it('allows returns from other calls to be used for the value parameter', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)

        const Math = Contract.createContract(adapter.getContract(TEST_ADDRESS, mathABI.abi as any), CommandFlags.CALL)

        const Test = Contract.createContract(
          adapter.getContract(TEST_ADDRESS, ['function deposit(uint x) payable' as any]),
        )

        const planner = new Planner()
        const sum = planner.add(Math.add(1, 2))
        planner.add(Test.deposit(123).withValue(sum))

        const { commands } = planner.plan()
        expect(commands.length).toBe(2)
        expect(commands).toEqual([
          '0x771602f7010001ffffffff01ddb53511e1e322133d03d5c0b8a9555c4c9904d0',
          '0xb6b55f25030102ffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0',
        ])
      }
    })

    it('does not allow value-calls for DELEGATECALL or STATICCALL', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        expect(() => Math.add(1, 2).withValue(3)).toThrow('Only CALL operations can send value')

        const StaticMath = Contract.createContract(
          adapter.getContract(TEST_ADDRESS, mathABI.abi as any),
          CommandFlags.STATICCALL,
        )
        expect(() => StaticMath.add(1, 2).withValue(3)).toThrow('Only CALL operations can send value')
      }
    })

    it('does not allow making DELEGATECALL static', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)
        const Math = mathContracts[adapterName]!

        expect(() => Math.add(1, 2).staticcall()).toThrow('Only CALL operations can be made static')
      }
    })

    it('uses extended commands where necessary', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)

        const Test = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function test(uint a, uint b, uint c, uint d, uint e, uint f, uint g) returns(uint)' as any,
          ]),
        )

        const planner = new Planner()
        planner.add(Test.test(1, 2, 3, 4, 5, 6, 7))
        const { commands } = planner.plan()
        expect(commands.length).toBe(2)
        expect(commands[0]).toBe('0xe473580d40000000000000ffddb53511e1e322133d03d5c0b8a9555c4c9904d0')
        expect(commands[1]).toBe('0x00010203040506ffffffffffffffffffffffffffffffffffffffffffffffffff')
      }
    })

    it('supports capturing the whole return value as a bytes', () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]!
        setGlobalAdapter(adapter)

        const Test = Contract.createLibrary(
          adapter.getContract(TEST_ADDRESS, [
            'function returnsTuple() returns(uint a, bytes32[] b)' as any,
            'function acceptsBytes(bytes raw)' as any,
          ]),
        )

        const planner = new Planner()
        const ret = planner.add(Test.returnsTuple().rawValue())
        planner.add(Test.acceptsBytes(ret))
        const { commands } = planner.plan()
        expect(commands).toEqual([
          '0x61a7e05e80ffffffffffff00ddb53511e1e322133d03d5c0b8a9555c4c9904d0',
          '0x3e9ef66a0080ffffffffffffddb53511e1e322133d03d5c0b8a9555c4c9904d0',
        ])
      }
    })
  })
})
