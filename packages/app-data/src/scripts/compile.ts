import * as fs from 'fs'
import $RefParser from 'json-schema-ref-parser'
import { compileFromFile } from 'json-schema-to-typescript'
import * as path from 'path'
import semverSort from 'semver-sort'

const SCHEMAS_SRC_PATH = path.join('src', 'schemas')
const SCHEMAS_DEST_PATH = 'schemas'
const TYPES_DEST_PATH = path.join('src', 'generatedTypes')

async function compile(): Promise<void> {
  // Creates destinations dirs
  console.info(`Creating '${TYPES_DEST_PATH}' and '${SCHEMAS_DEST_PATH}' dirs`)
  await fs.promises.mkdir(TYPES_DEST_PATH, { recursive: true })
  await fs.promises.mkdir(SCHEMAS_DEST_PATH)

  // Generates out file for types/index.ts
  const typesIndexPath = path.join(TYPES_DEST_PATH, 'index.ts')
  console.info(`Creating ${typesIndexPath} file`)
  const typesIndexFile = await fs.promises.open(typesIndexPath, 'w')

  // Generates out file for types/latest.ts
  const latestIndexPath = path.join(TYPES_DEST_PATH, 'latest.ts')
  const latestIndexFile = await fs.promises.open(latestIndexPath, 'w')

  const generatedFiles = [typesIndexFile, latestIndexFile]
  await generatedFiles.forEach(async (file) => {
    file.write(`// generated file, do not edit manually\n\n`)
  })

  // Lists all schemas
  const schemas = await fs.promises.readdir(SCHEMAS_SRC_PATH, { withFileTypes: true })
  const versions: string[] = []

  for (const schemaFileName of schemas) {
    // Ignores folders and non version schemas
    if (!schemaFileName.isFile() || !/^v\d+\.\d+\.\d+\.json$/.test(schemaFileName.name)) continue

    // Extracts version from file name
    const [version] = schemaFileName.name.split('.json')
    versions.push(version)

    // Get schema path relative to repo root
    const schemaPath = path.join(SCHEMAS_SRC_PATH, schemaFileName.name)

    // Compiles schema files de-referencing `$ref`s
    console.info(`Compiling bundled schema file for ${schemaPath}`)
    const newSchemaFile = await $RefParser.bundle(schemaPath)
    await fs.promises.writeFile(path.join(SCHEMAS_DEST_PATH, `${version}.json`), JSON.stringify(newSchemaFile))

    // Compiles schema onto ts type declarations
    console.info(`Compiling ts typings for ${schemaPath}`)
    const tsFile = await compileFromFile(schemaPath, { cwd: SCHEMAS_SRC_PATH })
    await fs.promises.writeFile(path.join(TYPES_DEST_PATH, `${version}.ts`), tsFile)

    // Add export on types/index.ts for this version
    console.info(`Adding ts export for ${version}`)
    const exportName = version.replace(/\./g, '_')
    const versionImportPath = `./${version}`
    await typesIndexFile.write(`import * as ${exportName} from '${versionImportPath}'\n`)
  }

  // Select latest version and also expose all versions
  if (versions.length) {
    const latest = semverSort.desc(versions)[0]
    const latestExport = versionNameToExport(latest)
    const allVersions = versions.map((version) => `\n  | ${versionNameToExport(version)}.AppDataRootSchema`).join('')
    const latestQuoteVersion = await getLatestMetadataDocVersion('quote')
    const latestReferrerVersion = await getLatestMetadataDocVersion('referrer')
    const latestOrderClassVersion = await getLatestMetadataDocVersion('orderClass')
    const latestUtmVersion = await getLatestMetadataDocVersion('utm')
    const latestHooksVersion = await getLatestMetadataDocVersion('hooks')
    const latestSignerVersion = await getLatestMetadataDocVersion('signer')
    const latestWidgetVersion = await getLatestMetadataDocVersion('widget')
    const latestPartnerFeeVersion = await getLatestMetadataDocVersion('partnerFee')
    const latestReplacedOrderVersion = await getLatestMetadataDocVersion('replacedOrder')

    const additionalTypesExport = `
export * from './latest'

export const LATEST_APP_DATA_VERSION = '${extractSemver(latest)}'
export const LATEST_QUOTE_METADATA_VERSION = '${extractSemver(latestQuoteVersion)}'
export const LATEST_REFERRER_METADATA_VERSION = '${extractSemver(latestReferrerVersion)}'
export const LATEST_ORDER_CLASS_METADATA_VERSION = '${extractSemver(latestOrderClassVersion)}'
export const LATEST_UTM_METADATA_VERSION = '${extractSemver(latestUtmVersion)}'
export const LATEST_HOOKS_METADATA_VERSION = '${extractSemver(latestHooksVersion)}'
export const LATEST_SIGNER_METADATA_VERSION = '${extractSemver(latestSignerVersion)}'
export const LATEST_WIDGET_METADATA_VERSION = '${extractSemver(latestWidgetVersion)}'
export const LATEST_PARTNER_FEE_METADATA_VERSION = '${extractSemver(latestPartnerFeeVersion)}'
export const LATEST_REPLACED_ORDER_METADATA_VERSION = '${extractSemver(latestReplacedOrderVersion)}'

export type LatestAppDataDocVersion = ${latestExport}.AppDataRootSchema
export type AnyAppDataDocVersion = ${allVersions}

export {${versions.map((version) => `\n  ${versionNameToExport(version)}`)}
}
`
    // Writes exports to types/index.ts
    await typesIndexFile.write(additionalTypesExport)

    // Writes exports to types/latest.ts
    await latestIndexFile.write(`export * as latest from './${latest}'\n`)
  }

  // Closes all files
  for (const file of generatedFiles) {
    await file.close()
  }
}

compile().then(() => console.log('Done'))

function versionNameToExport(name: string): string {
  return name.replace(/\./g, '_')
}

function extractSemver(name: string): string {
  return /(\d+\.\d+\.\d+)/.exec(name)?.[0] || ''
}

async function getLatestMetadataDocVersion(
  metadataDocName:
    | 'quote'
    | 'referrer'
    | 'orderClass'
    | 'utm'
    | 'hooks'
    | 'signer'
    | 'widget'
    | 'partnerFee'
    | 'replacedOrder'
): Promise<string> {
  const metadataPath = path.join(SCHEMAS_SRC_PATH, metadataDocName)
  const versions = await fs.promises.readdir(metadataPath)
  return semverSort.desc(versions)[0]
}
