import Ajv from 'ajv'
import fs from 'fs'
import path from 'path'

const ajv = new Ajv({ strict: false, allErrors: true })

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

// Validate a single schema file
function validateSchema(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const schema = JSON.parse(content)

    // Check if it's a valid JSON Schema
    ajv.compile(schema)

    return { valid: true, file: filePath }
  } catch (error) {
    return {
      valid: false,
      file: filePath,
      error: error.message,
      details: error.errors || [],
    }
  }
}

// Main validation
const schemasDir = path.join(__dirname, 'src', 'schemas')
const schemaFiles = findSchemaFiles(schemasDir)

console.log(`Found ${schemaFiles.length} schema files\n`)

const results = schemaFiles.map(validateSchema)
const invalid = results.filter((r) => !r.valid)

if (invalid.length === 0) {
  console.log('✅ All schemas are valid!')
  process.exit(0)
} else {
  console.log(`❌ Found ${invalid.length} invalid schemas:\n`)
  invalid.forEach((result) => {
    console.log(`File: ${result.file}`)
    console.log(`Error: ${result.error}`)
    if (result.details.length > 0) {
      console.log('Details:', JSON.stringify(result.details, null, 2))
    }
    console.log('---\n')
  })
  process.exit(1)
}
