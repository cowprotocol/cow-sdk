<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# Cow Shed SDK

The Cow Shed SDK is a TypeScript library that provides a set of functions to interact with the [Cow Shed contract](https://github.com/cowdao-grants/cow-shed).

In essence, CoW Shed acts as a user owned smart contract (1/1 multisig if you will) that can execute multiple calls on behalf of the user (once the user has pre-authorized the calls).

## Usage

### Individual Package Usage

```ts
import { ethers } from 'ethers'
import { CowShedSdk, ICoWShedCall, SupportedChainId } from '@cowprotocol/cow-shed'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Proper adapter initialization
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

const cowShedSdk = new CowShedSdk(adapter) // adapter is optional - will use global adapter if not provided

// Get the cow-shed account for any given chainId and owner's address
const cowShedAccount = cowShedSdk.getCowShedAccount(1, '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')

// Prepare the calls you want to execute using the cow-shed account
const calls: ICoWShedCall[] = [
  {
    target: '<contract-address-1>',
    callData: 'call-data-1',
    value: 0n,
    isDelegateCall: true,
    allowFailure: false,
  },
  {
    target: '<contract-address-2>',
    callData: '<call-data-2>',
    value: 0n,
    isDelegateCall: true,
    allowFailure: false,
  },
]

// Sign the calls
const preAuthorizedCall = await cowShedSdk.signCalls({
  chainId: SupportedChainId.MAINNET,
  calls,
  signer: '<privateKeyOrEthersSigner>', // signer is optional - will use global adapter's signer if not provided
})

// Get the details of the pre-authorized call you need to send
const { signedMulticall, gasLimit, cowShedAccount } = preAuthorizedCall
const { to, data, value } = signedMulticall

// Execute the transaction using any wallet. The calldata has been pre-authed, so you don't need any
// special permissions to send this transaction
let anotherWallet = new ethers.Wallet('<another-private-key>')
const tx = await anotherWallet.sendTransaction({
  to,
  data,
  value,
  gasLimit,
})
```

### Using via Cow SDK

You can also import `CowShedSdk` directly from the main SDK:

```ts
import { ethers } from 'ethers'
import { CowShedSdk, ICoWShedCall, SupportedChainId } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Proper adapter initialization
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

const cowShedSdk = new CowShedSdk(adapter) // adapter is optional - will use global adapter if not provided
// ... rest of the usage remains the same
```

### Using with CowSdk Umbrella

For a unified experience with all CoW Protocol modules:

```ts
import { ethers } from 'ethers'
import { CowSdk, SupportedChainId, ICoWShedCall } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Proper adapter initialization
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

const cowSdk = new CowSdk({
  adapter,
  chainId: SupportedChainId.MAINNET,
})

// Access cowShed through the umbrella SDK
const cowShedSdk = cowSdk.cowShed

// Prepare the calls you want to execute using the cow-shed account
const calls: ICoWShedCall[] = [
  {
    target: '<contract-address-1>',
    callData: 'call-data-1',
    value: 0n,
    isDelegateCall: true,
    allowFailure: false,
  },
]

// Sign the calls
const preAuthorizedCall = await cowShedSdk.signCalls({
  chainId: SupportedChainId.MAINNET,
  calls,
  signer: '<privateKeyOrEthersSigner>', // signer is optional - will use global adapter's signer if not provided
})

// Execute the transaction using any wallet
const { signedMulticall, gasLimit } = preAuthorizedCall
const { to, data, value } = signedMulticall

let anotherWallet = new ethers.Wallet('<another-private-key>')
const tx = await anotherWallet.sendTransaction({
  to,
  data,
  value,
  gasLimit,
})
```
