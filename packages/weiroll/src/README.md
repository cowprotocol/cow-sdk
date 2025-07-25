# Weiroll utils

This module some utilities to simplify the use of the [Weiroll contract](https://github.com/weiroll/weiroll).

Weiroll is a simple and efficient operation-chaining/scripting language for the EVM.

The main utilities function are:

- `createWeirollContract` which creates a Weiroll contract from an ethers contract to perform evm calls.
- `createWeirollLibrary` which creates a Weiroll library from an ethers contract to perform static calls.
- `createWeirollDelegateCall` which returns an EVM `delegatecall` with some plan encoded as Weiroll calldata.

To understand how this works, let's see an example:

## Usage

```ts
import { CommandFlags, createWeirollDelegateCall, createWeirollContract } from './index'
import { Planner, Contract as WeirollContract } from '@weiroll/weiroll.js'
import { ethers } from 'ethers'

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
] as const

// Create ethers DAI contract
const contract = new ethers.Contract('0x6b175474e89094c44da98b954eedeac495271d0f', ERC20_ABI)

// Create the Weiroll contract (wrapping the ethers contract)
// You can choose between different command flags, like `CALL`, `DELEGATECALL`, `STATICCALL`, etc.
const daiContract = createWeirollContract(contract, CommandFlags.CALL)

// Let's pretend we have a smart contract that wants to transfer all DAI to Vitalik
const ownerContractAddress = '0xf6e72Db5454dd049d0788e411b06CfAF16853042'

// Main function to create the delegatecall
const { to, value, data } = createWeirollDelegateCall((planner: Planner) => {
  // Add to plan: Get the balance of the token
  const daiBalance = planner.add(daiContract.balanceOf(ownerContractAddress))

  // Add to plan: Transfer all balance to Vitalik. Note how we can chain the balance from previous call
  planner.add(daiContract.transfer('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', daiBalance))
})

// Execute the delegatecall from "ownerContract" context.
// For illustration purposes, lets imagine there's a contract with a function `executeDelegateCall` (not a very realistic example because this would likely need a signature to be safe)

// Create instance of owner contract
const SMART_ACCOUNT_ABI = ['function executeDelegateCall(address,uint256,bytes)']
const ownerContract = new ethers.Contract(ownerContractAddress, SMART_ACCOUNT_ABI)

// Execute the delegatecall, transferring all DAI to Vitalik
const tx = await ownerContract.executeDelegateCall(to, value, data)
```
