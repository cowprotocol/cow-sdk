import { AnyAppDataDocVersion } from './generatedTypes'

export async function importSchema(version: string): Promise<AnyAppDataDocVersion> {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`AppData version ${version} is not a valid version`)
  }
  try {
    return await import(`../schemas/v${version}.json`)
  } catch (e) {
    throw new Error(`AppData version ${version} doesn't exist`)
  }
}
