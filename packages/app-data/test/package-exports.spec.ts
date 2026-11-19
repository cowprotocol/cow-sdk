import { execFileSync } from 'child_process'
import * as path from 'path'

const PACKAGE_ROOT = path.resolve(__dirname, '..')

/**
 * Runs Node.js itself (not Jest's resolver) from the package root, so the package self-references
 * its name and specifiers go through the "exports" map exactly as for consumers of the published package.
 */
function runNode(args: string[]): string {
  return execFileSync(process.execPath, args, { cwd: PACKAGE_ROOT, encoding: 'utf8', stdio: 'pipe' }).trim()
}

function resolveSpecifier(specifier: string): string {
  const script = `try { console.log(require.resolve(${JSON.stringify(specifier)})) } catch (e) { console.log(e.code) }`
  return runNode(['-e', script])
}

describe('Package exports', () => {
  test('Exposes the schemas documented in the README', () => {
    expect(resolveSpecifier('@cowprotocol/sdk-app-data/schemas/v0.4.0.json')).toBe(
      path.join(PACKAGE_ROOT, 'schemas', 'v0.4.0.json'),
    )
  })

  test('Loads schemas from native ES modules', () => {
    const script = `import schema from '@cowprotocol/sdk-app-data/schemas/v0.4.0.json' with { type: 'json' }; console.log(schema.$id)`

    expect(runNode(['--input-type=module', '-e', script])).toMatch('v0.4.0')
  })

  test.each(['@cowprotocol/sdk-app-data/schemas/v0.4.0', '@cowprotocol/sdk-app-data/src/importSchema.ts'])(
    'Does not expose %s',
    (specifier) => {
      expect(resolveSpecifier(specifier)).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED')
    },
  )
})
