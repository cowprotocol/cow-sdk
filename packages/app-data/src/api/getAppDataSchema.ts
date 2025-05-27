import { AnyAppDataDocVersion } from '../generatedTypes'
import { MetaDataError } from '../consts'
import { importSchema } from '../importSchema'

/**
 * Wrapper around @cowprotocol/app-data getAppDataSchema
 *
 * Returns the appData schema for given version, if any
 * Throws CowError when version doesn't exist
 */
export async function getAppDataSchema(version: string): Promise<AnyAppDataDocVersion> {
  try {
    return await importSchema(version)
  } catch (e) {
    // Wrapping @cowprotocol/app-data Error into CowError
    const error = e as Error
    throw new MetaDataError(error.message)
  }
}
