import { getGlobalAdapter } from '@cowprotocol/sdk-common'

const EIP7702_DELEGATION_PREFIX = '0xef0100'
const EIP7702_DELEGATION_HEX_LENGTH = 2 + 23 * 2 // "0x" + 23 bytes

/**
 * True if the address holds an EIP-7702 set-code marker (`0xef0100 || delegate`,
 * 23 bytes). These accounts are still EOAs but their `signTypedData_v4` may
 * return non-ECDSA bytes (ERC-7739 nested envelopes, ERC-7579 / Modular Account
 * v2 validator-prefixed sigs). The bytes verify via the owner's
 * `isValidSignature`, which 7702 dispatches to the delegate.
 *
 * Any RPC error is swallowed and treated as "not delegated" so plain EOAs
 * aren't penalized when `getCode` is unavailable.
 */
export async function getIsEip7702Account(owner: string): Promise<boolean> {
  try {
    const code = await getGlobalAdapter().getCode(owner)

    if (!code || typeof code !== 'string') return false

    const lower = code.toLowerCase()
    return lower.length === EIP7702_DELEGATION_HEX_LENGTH && lower.startsWith(EIP7702_DELEGATION_PREFIX)
  } catch {
    // Treat any RPC error as "not delegated" — fall through to the existing
    // signing path so plain EOAs aren't penalized when getCode is unavailable.
    return false
  }
}
