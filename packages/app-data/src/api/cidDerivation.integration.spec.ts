/**
 * Integration tests for CID / appDataHex derivation.
 *
 * Unlike the sibling *.spec.ts files, this suite mocks nothing — not
 * `multiformats`, not the adapter crypto, not the internal `utils/ipfs`
 * helpers. It runs the real dependency chain and asserts the exact bytes each
 * function produces.
 *
 * Why this exists: `appDataHex` is the bytes32 in the on-chain order struct,
 * and the CoW backend derives the same value independently. The mocked specs
 * stub out `base16.encode` and `appDataHexToCid`, so they verify call wiring
 * rather than output correctness — a change that silently alters the derived
 * bytes still passes them. This suite fails instead.
 *
 * Expected values come from src/mocks.ts; CID/CID_2 are cross-checked against
 * the CoW backend fixtures (crates/app-data-hash).
 */
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../test/setup'
import {
  APP_DATA_DOC,
  APP_DATA_HEX,
  APP_DATA_HEX_2,
  APP_DATA_STRING,
  APP_DATA_STRING_2,
  CID,
  CID_2,
} from '../mocks'
import { appDataHexToCid } from './appDataHexToCid'
import { cidToAppDataHex } from './cidToAppDataHex'
import { getAppDataInfo } from './getAppDataInfo'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

// Run every derivation against all three adapters: the CID/hex output must be
// identical regardless of the underlying crypto (ethers v5/v6, viem).
describe.each(adapterNames)('cid derivation — keccak256 / raw 0x55 / base16 [%s adapter]', (adapterName) => {
  beforeAll(() => {
    setGlobalAdapter(adapters[adapterName])
  })

  test('appDataHexToCid: hex -> cid is byte-stable', async () => {
    expect(await appDataHexToCid(APP_DATA_HEX)).toBe(CID)
    expect(await appDataHexToCid(APP_DATA_HEX_2)).toBe(CID_2)
  })

  test('cidToAppDataHex: cid -> hex is byte-stable', async () => {
    expect(await cidToAppDataHex(CID)).toBe(APP_DATA_HEX)
    expect(await cidToAppDataHex(CID_2)).toBe(APP_DATA_HEX_2)
  })

  test('round-trips: hex -> cid -> hex and cid -> hex -> cid', async () => {
    expect(await cidToAppDataHex(await appDataHexToCid(APP_DATA_HEX))).toBe(APP_DATA_HEX)
    expect(await appDataHexToCid(await cidToAppDataHex(CID))).toBe(CID)
  })

  test('getAppDataInfo(doc): full derivation from a document object', async () => {
    const info = await getAppDataInfo(APP_DATA_DOC)
    expect(info).toEqual({
      cid: CID,
      appDataHex: APP_DATA_HEX,
      appDataContent: APP_DATA_STRING,
    })
  })

  test('getAppDataInfo(string): full derivation from a fullAppData string', async () => {
    // APP_DATA_STRING_2 is the CoW backend's own fixture (services repo)
    const info = await getAppDataInfo(APP_DATA_STRING_2)
    expect(info).toEqual({
      cid: CID_2,
      appDataHex: APP_DATA_HEX_2,
      appDataContent: APP_DATA_STRING_2,
    })
  })
})
