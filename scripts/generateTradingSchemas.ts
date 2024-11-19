import { Config, createGenerator } from 'ts-json-schema-generator'
import { writeFileSync, mkdirSync } from 'fs'

const config: Config = {
  path: 'src/trading/types.ts',
  expose: 'none',
  topRef: false,
}

const types = [
  'QuoterParameters',
  'TradeParameters',
  'LimitTradeParameters',
  'SwapAdvancedSettings',
  'LimitOrderAdvancedSettings',
  'QuoteResultsSerialized',
]

const outputPath = 'dist/schemas/trading/'

const generator = createGenerator(config)

mkdirSync(outputPath, { recursive: true })

types.forEach((type) => {
  const schema = generator.createSchema(type)
  const schemaString = JSON.stringify(schema, null, 2)

  writeFileSync(outputPath + `${type}.ts`, `export default ${schemaString} as const`)
})
