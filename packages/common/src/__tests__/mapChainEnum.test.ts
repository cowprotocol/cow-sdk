import {
  AdditionalTargetChainId,
  EvmChains,
  NonEvmChains,
  SupportedChainId,
  TargetChainId,
  mapChainEnum,
} from '@cowprotocol/sdk-config'

describe('mapChainEnum', () => {
  describe('single enum', () => {
    it('builds a record keyed by every numeric value (constant form)', () => {
      const result = mapChainEnum(EvmChains, 'rpc')

      // Every numeric value in EvmChains must be a key.
      const expectedKeys = Object.values(EvmChains)
        .filter((v): v is number => typeof v === 'number')
        .sort((a, b) => a - b)
      const actualKeys = Object.keys(result)
        .map(Number)
        .sort((a, b) => a - b)

      expect(actualKeys).toEqual(expectedKeys)
      // Every value is the constant.
      for (const v of Object.values(result)) {
        expect(v).toBe('rpc')
      }
    })

    it('builds a record using the factory form, calling it with the chain id', () => {
      const result = mapChainEnum(SupportedChainId, (id) => `chain-${id}`)

      expect(result[SupportedChainId.MAINNET]).toBe(`chain-${SupportedChainId.MAINNET}`)
      expect(result[SupportedChainId.GNOSIS_CHAIN]).toBe(`chain-${SupportedChainId.GNOSIS_CHAIN}`)
      expect(result[SupportedChainId.SOLANA]).toBe(`chain-${SupportedChainId.SOLANA}`)
    })

    it('skips the runtime reverse mapping that numeric enums emit', () => {
      // Numeric enums put name→value AND "value"→name in the runtime object.
      // The helper must only produce numeric-keyed entries (no "MAINNET" key).
      const result = mapChainEnum(EvmChains, 'x')

      for (const key of Object.keys(result)) {
        expect(Number.isFinite(Number(key))).toBe(true)
      }
      expect((result as Record<string, string>)['MAINNET']).toBeUndefined()
    })

    it('covers every member of SupportedChainId', () => {
      const result = mapChainEnum(SupportedChainId, 0)
      const expectedCount = Object.values(SupportedChainId).filter((v) => typeof v === 'number').length

      expect(Object.keys(result)).toHaveLength(expectedCount)
    })
  })

  describe('multiple enums', () => {
    it('unions all numeric values across the passed enums', () => {
      const result = mapChainEnum(SupportedChainId, AdditionalTargetChainId, (id) => id)

      const supportedIds = Object.values(SupportedChainId).filter((v): v is number => typeof v === 'number')
      const additionalIds = Object.values(AdditionalTargetChainId).filter(
        (v): v is number => typeof v === 'number',
      )

      // Both enums' values must be present.
      for (const id of [...supportedIds, ...additionalIds]) {
        expect(result[id as TargetChainId]).toBe(id)
      }
    })

    it('produces the same key set as the legacy mapAllNetworks shape', () => {
      // (SupportedChainId, AdditionalTargetChainId) ≡ TargetChainId by construction.
      const result = mapChainEnum(SupportedChainId, AdditionalTargetChainId, 'v')

      const expected = new Set<number>([
        ...Object.values(SupportedChainId).filter((v): v is number => typeof v === 'number'),
        ...Object.values(AdditionalTargetChainId).filter((v): v is number => typeof v === 'number'),
      ])
      const actual = new Set<number>(Object.keys(result).map(Number))

      expect(actual).toEqual(expected)
    })

    it('dedupes overlapping ids when the same chain appears in two enums', () => {
      // EvmChains and SupportedChainId share most values (MAINNET=1, etc).
      // The factory should still be called per unique id, last write wins (== overwrites).
      const calls: number[] = []
      mapChainEnum(EvmChains, SupportedChainId, (id) => {
        calls.push(id)
        return id
      })

      // Each unique chain id should appear at most twice in the call log (once per enum it's in).
      const callCounts = calls.reduce<Map<number, number>>(
        (m, id) => m.set(id, (m.get(id) ?? 0) + 1),
        new Map(),
      )
      for (const [, count] of callCounts) {
        expect(count).toBeLessThanOrEqual(2)
      }
    })

    it('handles EvmChains + NonEvmChains (TargetChainId-shaped coverage)', () => {
      const result = mapChainEnum(EvmChains, NonEvmChains, (id) => `n${id}`)

      // Solana from NonEvmChains and Mainnet from EvmChains must both be present.
      expect(result[NonEvmChains.SOLANA]).toBe(`n${NonEvmChains.SOLANA}`)
      expect(result[EvmChains.MAINNET]).toBe(`n${EvmChains.MAINNET}`)
    })
  })

  describe('value forms', () => {
    it('treats a function as a factory (not as a constant value)', () => {
      const fn = (id: number): string => `id=${id}`
      const result = mapChainEnum(SupportedChainId, fn)

      // The result values must be the factory output, not the factory itself.
      const mainnetEntry = result[SupportedChainId.MAINNET]
      expect(typeof mainnetEntry).toBe('string')
      expect(mainnetEntry).toBe(`id=${SupportedChainId.MAINNET}`)
    })

    it('supports complex constant values (object, array)', () => {
      const arr: number[] = []
      const result = mapChainEnum(EvmChains, arr)

      // All keys share the same reference (constant form, no per-key clone).
      const values = Object.values(result)
      for (const v of values) {
        expect(v).toBe(arr)
      }
    })
  })
})
