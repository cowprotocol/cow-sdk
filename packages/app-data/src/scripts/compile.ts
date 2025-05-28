import * as fs from 'fs'
import $RefParser from 'json-schema-ref-parser'
import { compileFromFile } from 'json-schema-to-typescript'
import * as path from 'path'
import semverSort from 'semver-sort'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SCHEMAS_SRC_PATH = path.resolve(__dirname, '..', 'schemas')
const SCHEMAS_DEST_PATH = path.resolve(__dirname, '..', '..', 'schemas')
const TYPES_DEST_PATH = path.resolve(__dirname, '..', 'generatedTypes')

async function compile(): Promise<void> {
  // Creates destinations dirs
  console.log('Starting compilation...')
  console.log(`Source schemas path: ${SCHEMAS_SRC_PATH}`)
  console.log(`Destination schemas path: ${SCHEMAS_DEST_PATH}`)
  console.log(`Types destination path: ${TYPES_DEST_PATH}`)

  // Check if the schemas directory exists
  try {
    await fs.promises.access(SCHEMAS_SRC_PATH)
  } catch {
    console.error(`Schemas directory ${SCHEMAS_SRC_PATH} does not exist or is not accessible!`)
    console.error('Make sure you have copied the schema files from the original app-data repository')
    return
  }

  // Creates destination dirs
  console.info(`Creating '${TYPES_DEST_PATH}' and '${SCHEMAS_DEST_PATH}' dirs`)
  await fs.promises.mkdir(TYPES_DEST_PATH, { recursive: true })
  await fs.promises.mkdir(SCHEMAS_DEST_PATH, { recursive: true })

  // Generates out file for types/index.ts
  const typesIndexPath = path.join(TYPES_DEST_PATH, 'index.ts')
  console.info(`Creating ${typesIndexPath} file`)
  const typesIndexFile = await fs.promises.open(typesIndexPath, 'w')

  // Generates out file for types/latest.ts
  const latestIndexPath = path.join(TYPES_DEST_PATH, 'latest.ts')
  console.info(`Creating ${latestIndexPath} file`)
  const latestIndexFile = await fs.promises.open(latestIndexPath, 'w')

  const generatedFiles = [typesIndexFile, latestIndexFile]
  for (const file of generatedFiles) {
    await file.write(`// generated file, do not edit manually\n\n`)
  }

  // Lists all schemas
  try {
    const schemaFiles = await fs.promises.readdir(SCHEMAS_SRC_PATH)
    console.log(`Found ${schemaFiles.length} files in schemas directory`)

    const versionSchemas = schemaFiles.filter((filename) => /^v\d+\.\d+\.\d+\.json$/.test(filename))
    console.log(`Found ${versionSchemas.length} version schema files`)

    const versions: string[] = []

    for (const schemaFileName of versionSchemas) {
      // Extracts version from file name
      const version = schemaFileName.split('.json')[0]
      if (!version) continue
      versions.push(version)

      // Get schema path relative to repo root
      const schemaPath = path.join(SCHEMAS_SRC_PATH, schemaFileName)

      // Compiles schema files de-referencing `$ref`s
      console.info(`Compiling bundled schema file for ${schemaPath}`)
      const parser = new ($RefParser as unknown as { new (): $RefParser })()
      const newSchemaFile = await parser.bundle(schemaPath)
      await fs.promises.writeFile(path.join(SCHEMAS_DEST_PATH, `${version}.json`), JSON.stringify(newSchemaFile))

      // Compiles schema onto ts type declarations
      console.info(`Compiling ts typings for ${schemaPath}`)
      try {
        const tsFile = await compileFromFile(schemaPath, { cwd: SCHEMAS_SRC_PATH })
        await fs.promises.writeFile(path.join(TYPES_DEST_PATH, `${version}.ts`), tsFile)

        // Add export on types/index.ts for this version
        console.info(`Adding ts export for ${version}`)
        const exportName = version.replace(/\./g, '_')
        const versionImportPath = `./${version}`
        await typesIndexFile.write(`import * as ${exportName} from '${versionImportPath}'\n`)
      } catch (error) {
        console.error(`Error compiling typings for ${schemaPath}:`, error)
      }
    }
    console.log(`Processed ${versions.length} version schemas`)

    // Select latest version and also expose all versions
    if (versions.length) {
      const latest = semverSort.desc(versions)[0]
      if (!latest) {
        console.error('No latest version found')
        return
      }
      console.log(`Latest version is ${latest}`)

      const latestExport = versionNameToExport(latest)
      const allVersions = versions.map((version) => `\n  | ${versionNameToExport(version)}.AppDataRootSchema`).join('')

      try {
        // Get latest metadata versions
        console.log('Getting latest metadata versions...')
        const metadataResults = await Promise.allSettled([
          getLatestMetadataDocVersion('quote'),
          getLatestMetadataDocVersion('referrer'),
          getLatestMetadataDocVersion('orderClass'),
          getLatestMetadataDocVersion('utm'),
          getLatestMetadataDocVersion('hooks'),
          getLatestMetadataDocVersion('signer'),
          getLatestMetadataDocVersion('widget'),
          getLatestMetadataDocVersion('partnerFee'),
          getLatestMetadataDocVersion('replacedOrder'),
        ])

        const [
          latestQuoteVersion,
          latestReferrerVersion,
          latestOrderClassVersion,
          latestUtmVersion,
          latestHooksVersion,
          latestSignerVersion,
          latestWidgetVersion,
          latestPartnerFeeVersion,
          latestReplacedOrderVersion,
        ] = metadataResults.map((result) => (result.status === 'fulfilled' ? result.value : ''))

        const additionalTypesExport = `
          export * from './latest'

          export const LATEST_APP_DATA_VERSION = '${extractSemver(latest)}'
          export const LATEST_QUOTE_METADATA_VERSION = '${extractSemver(latestQuoteVersion || '')}'
          export const LATEST_REFERRER_METADATA_VERSION = '${extractSemver(latestReferrerVersion || '')}'
          export const LATEST_ORDER_CLASS_METADATA_VERSION = '${extractSemver(latestOrderClassVersion || '')}'
          export const LATEST_UTM_METADATA_VERSION = '${extractSemver(latestUtmVersion || '')}'
          export const LATEST_HOOKS_METADATA_VERSION = '${extractSemver(latestHooksVersion || '')}'
          export const LATEST_SIGNER_METADATA_VERSION = '${extractSemver(latestSignerVersion || '')}'
          export const LATEST_WIDGET_METADATA_VERSION = '${extractSemver(latestWidgetVersion || '')}'
          export const LATEST_PARTNER_FEE_METADATA_VERSION = '${extractSemver(latestPartnerFeeVersion || '')}'
          export const LATEST_REPLACED_ORDER_METADATA_VERSION = '${extractSemver(latestReplacedOrderVersion || '')}'

          export type LatestAppDataDocVersion = ${latestExport}.AppDataRootSchema
          export type AnyAppDataDocVersion = ${allVersions}

          export {${versions.map((version) => `\n  ${versionNameToExport(version)}`)}
          }
        `
        // Write exports to types/index.ts
        await typesIndexFile.write(additionalTypesExport)

        // Write exports to types/latest.ts
        await latestIndexFile.write(`export * as latest from './${latest}'\n`)
      } catch (e) {
        console.error('Error generating metadata version exports:', e)

        // Simplified version without specific metadata
        const additionalTypesExport = `
          export * from './latest'

          export const LATEST_APP_DATA_VERSION = '${extractSemver(latest)}'

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
    } else {
      console.error('No version schemas found!')
    }
  } catch (e) {
    console.error('Error processing schemas:', e)
  }

  // Closes all files
  for (const file of generatedFiles) {
    await file.close()
  }

  console.log('Compilation completed successfully!')
}

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
    | 'replacedOrder',
): Promise<string> {
  const metadataPath = path.join(SCHEMAS_SRC_PATH, metadataDocName)
  try {
    const exists = await fs.promises
      .access(metadataPath)
      .then(() => true)
      .catch(() => false)
    if (!exists) {
      console.warn(`Metadata directory ${metadataPath} does not exist`)
      return ''
    }

    const files = await fs.promises.readdir(metadataPath)
    if (files.length === 0) {
      console.warn(`No files found in ${metadataPath}`)
      return ''
    }

    const versionFiles = files.filter((file) => /^v\d+\.\d+\.\d+\.json$/.test(file))
    if (versionFiles.length === 0) {
      console.warn(`No version files found in ${metadataPath}`)
      return ''
    }

    const versions = versionFiles.map((file) => file.split('.json')[0])

    return semverSort.desc(versions.filter((v): v is string => v !== undefined))[0] || ''
  } catch (e) {
    console.warn(`Error getting latest metadata version for ${metadataDocName}:`, e)
    return ''
  }
}

// execution the compilation
compile()
  .then(() => console.log('Done!'))
  .catch((e) => {
    console.error('Compilation failed with error:', e)
    process.exit(1)
  })
