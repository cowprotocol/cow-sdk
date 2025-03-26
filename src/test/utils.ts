import { jsonWithBigintReplacer } from '../common/utils/serialize'

function serialize(obj: unknown): string {
  return JSON.stringify(obj, jsonWithBigintReplacer, 2)
}

export function expectToEqual(actual: unknown, expected: unknown) {
  expect(serialize(actual)).toEqual(serialize(expected))
}
