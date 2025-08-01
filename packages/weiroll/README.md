<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Weiroll

This package provides adapter-agnostic Weiroll functionality for the CoW Protocol SDK. Weiroll is a powerful scripting language for executing complex multi-step transactions on Ethereum.

## Package Origin

This package represents a refactored version of the original [weiroll.js](https://github.com/weiroll/weiroll.js) library. The original library was tightly coupled to ethers.js v5, but this version has been completely refactored to:

- **Remove ethers v5 dependency** - Works with any supported blockchain library
- **Support multiple adapters** - Compatible with ethers v5, ethers v6, and viem
- **Maintain API compatibility** - 100% compatible with original weiroll.js API
- **Enable SDK integration** - Seamlessly integrate with the CoW Protocol SDK ecosystem

## Installation

```bash
npm install @cowprotocol/sdk-weiroll
or
pnpm add @cowprotocol/sdk-weiroll
or
yarn add @cowprotocol/sdk-weiroll
```

## Usage

### Individual package usage

```typescript
import {
  WeirollPlanner,
  createWeirollContract,
  createWeirollDelegateCall,
  WeirollCommandFlags,
} from '@cowprotocol/sdk-weiroll'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Create weiroll contract wrapper
const contract = adapter.getContract(contractAddress, abi)
const weirollContract = createWeirollContract(contract, WeirollCommandFlags.CALL)

// Plan weiroll transaction
const planner = new WeirollPlanner()
planner.add(weirollContract.someFunction(param1, param2))

// Generate delegate call
const evmCall = createWeirollDelegateCall((planner) => {
  planner.add(weirollContract.someFunction(param1, param2))
})
```

## Features

- **Multi-step transactions** - Plan and execute complex transaction sequences
- **Gas optimization** - Efficient execution through delegate calls
- **Return value chaining** - Use outputs from one call as inputs to another
- **Adapter agnostic** - Works with ethers v5, v6, and viem
- **Type safety** - Full TypeScript support

> **Note:** This package maintains 100% API compatibility with the original weiroll.js library while adding support for multiple blockchain adapters.
