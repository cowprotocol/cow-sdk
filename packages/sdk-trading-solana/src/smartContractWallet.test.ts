import { SOLANA_SETTLEMENT_PROGRAM_ID } from '@cowprotocol/sdk-config'
import { Keypair, PublicKey } from '@solana/web3.js'
import { isSolanaSmartContractWallet } from './smartContractWallet'

const [OFF_CURVE_OWNER] = PublicKey.findProgramAddressSync(
  [Buffer.from('vault')],
  new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID),
)

describe('isSolanaSmartContractWallet', () => {
  it('is false for an ordinary keypair owner', () => {
    expect(isSolanaSmartContractWallet(Keypair.generate().publicKey)).toBe(false)
  })

  it('is true for a program-derived address such as a multisig vault', () => {
    expect(PublicKey.isOnCurve(OFF_CURVE_OWNER.toBytes())).toBe(false)
    expect(isSolanaSmartContractWallet(OFF_CURVE_OWNER)).toBe(true)
  })

  it('accepts the base58 form as well as a PublicKey', () => {
    expect(isSolanaSmartContractWallet(Keypair.generate().publicKey.toBase58())).toBe(false)
    expect(isSolanaSmartContractWallet(OFF_CURVE_OWNER.toBase58())).toBe(true)
  })

  // A caller holding a bare address often cannot tell which chain it came from, and answering a
  // non-Solana one with a throw turns that into a crash rather than a `false`.
  it.each([
    ['an EVM address', '0x9FA3c00a92Ec5f96B1Ad2527ab41B3932EFEDa58'],
    ['a non-base58 string', 'ergerger2'],
    ['too few bytes to be a key', 'ff'],
    ['an empty string', ''],
  ])('is false rather than throwing for %s', (_label, owner) => {
    expect(isSolanaSmartContractWallet(owner)).toBe(false)
  })
})
