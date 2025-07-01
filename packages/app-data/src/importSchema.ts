import { CowError } from '@cowprotocol/sdk-common'
import { AnyAppDataDocVersion } from './generatedTypes'
import * as fs from 'fs'
import * as path from 'path'

const SCHEMAS_DIR = path.resolve(process.cwd(), 'schemas')
const schemaCache: Record<string, AnyAppDataDocVersion> = {}

export async function importSchema(version: string): Promise<AnyAppDataDocVersion> {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`AppData version ${version} is not a valid version`)
  }

  if (schemaCache[version]) {
    return schemaCache[version]
  }

  try {
    const schemaPath = path.join(SCHEMAS_DIR, `v${version}.json`)

    const content = fs.readFileSync(schemaPath, 'utf8')
    const schema = JSON.parse(content) as AnyAppDataDocVersion

    schemaCache[version] = schema

    return schema
  } catch {
    throw new CowError(`AppData version ${version} doesn't exist`)
  }
}
