import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Find all JSON schema files
function findSchemaFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findSchemaFiles(filePath, fileList)
    } else if (file.endsWith('.json')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

// Check if schema ID matches filename
function checkSchemaId(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const schema = JSON.parse(content)

    const fileName = path.basename(filePath, '.json')

    // Extract version from filename
    const fileVersion = fileName

    // Extract $id from schema
    const schemaId = schema.$id

    if (!schemaId) {
      return {
        file: filePath,
        issue: 'Missing $id',
        fileName,
        schemaId: null,
      }
    }

    // Check if ID matches filename
    const idMatch = schemaId.match(/v?\d+\.\d+\.\d+/)
    const idVersion = idMatch ? idMatch[0] : null

    // Check default version in schema
    let defaultVersion = null
    if (schema.properties && schema.properties.version && schema.properties.version.default) {
      defaultVersion = schema.properties.version.default
    }

    const issues = []

    // Normalize versions for comparison (remove 'v' prefix if present)
    const normalizedFileVersion = fileVersion.replace(/^v/, '')
    const normalizedIdVersion = idVersion ? idVersion.replace(/^v/, '') : null
    const normalizedDefaultVersion = defaultVersion

    // Check if schema ID version matches filename
    if (normalizedIdVersion && normalizedIdVersion !== normalizedFileVersion) {
      issues.push(`ID version mismatch: file=${fileVersion}, $id=${idVersion}`)
    }

    // Check if default version matches filename
    if (normalizedDefaultVersion && normalizedDefaultVersion !== normalizedFileVersion) {
      issues.push(`Default version mismatch: file=${fileVersion}, default=${defaultVersion}`)
    }

    if (issues.length > 0) {
      return {
        file: filePath,
        fileName,
        schemaId,
        defaultVersion,
        issues,
      }
    }

    return null
  } catch (error) {
    return {
      file: filePath,
      issue: `Error: ${error.message}`,
    }
  }
}

// Main check
const schemasDir = path.join(__dirname, '..', 'src', 'schemas')
const schemaFiles = findSchemaFiles(schemasDir)

console.log(`Checking ${schemaFiles.length} schema files for ID mismatches...\n`)

const problems = schemaFiles.map(checkSchemaId).filter((result) => result !== null)

if (problems.length === 0) {
  console.log('✅ All schema IDs match their filenames!')
} else {
  console.log(`❌ Found ${problems.length} files with ID mismatches:\n`)
  problems.forEach((problem) => {
    console.log(`File: ${path.relative(schemasDir, problem.file)}`)
    if (problem.issue) {
      console.log(`  Issue: ${problem.issue}`)
    }
    if (problem.schemaId) {
      console.log(`  $id: ${problem.schemaId}`)
    }
    if (problem.defaultVersion) {
      console.log(`  Default version: ${problem.defaultVersion}`)
    }
    if (problem.issues) {
      problem.issues.forEach((issue) => {
        console.log(`  ⚠️  ${issue}`)
      })
    }
    console.log('')
  })
}
