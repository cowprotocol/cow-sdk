import { extractDigest } from '../utils/ipfs'

/**
 * Convert a CID to an app-data hex string
 *
 * @param cid - The IPFS CID to extract the app-data hex from.
 * @returns The app-data hex string (app-data part of the order struct)
 */
export async function cidToAppDataHex(cid: string): Promise<string> {
  return extractDigest(cid)
}
