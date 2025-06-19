import { QuoteAndPost } from '../trading'
import { BridgeQuoteAndPost } from './types'
import {
  assertIsBridgeQuoteAndPost,
  assertIsQuoteAndPost,
  getPostHooks,
  isAppDoc,
  isBridgeQuoteAndPost,
  isQuoteAndPost,
} from './utils'

describe('Quote type checks', () => {
  const bridgeQuote = {
    bridge: 'test-bridge',
    quoteResults: {},
    postSwapOrderFromQuote: jest.fn(),
  } as unknown as BridgeQuoteAndPost

  const regularQuote = {
    quoteResults: {},
    postSwapOrderFromQuote: jest.fn(),
  } as unknown as QuoteAndPost

  describe('isBridgeQuoteAndPost', () => {
    it('should return true for bridge quotes', () => {
      expect(isBridgeQuoteAndPost(bridgeQuote)).toBe(true)
    })

    it('should return false for regular quotes', () => {
      expect(isBridgeQuoteAndPost(regularQuote)).toBe(false)
    })
  })

  describe('isQuoteAndPost', () => {
    it('should return true for regular quotes', () => {
      expect(isQuoteAndPost(regularQuote)).toBe(true)
    })

    it('should return false for bridge quotes', () => {
      expect(isQuoteAndPost(bridgeQuote)).toBe(false)
    })
  })

  describe('assertIsBridgeQuoteAndPost', () => {
    it('should not throw for bridge quotes', () => {
      expect(() => assertIsBridgeQuoteAndPost(bridgeQuote)).not.toThrow()
    })

    it('should throw for regular quotes', () => {
      expect(() => assertIsBridgeQuoteAndPost(regularQuote)).toThrow(
        'Quote result is not of type BridgeQuoteAndPost. Are you sure the sell and buy chains different?',
      )
    })
  })

  describe('assertIsQuoteAndPost', () => {
    it('should not throw for regular quotes', () => {
      expect(() => assertIsQuoteAndPost(regularQuote)).not.toThrow()
    })

    it('should throw for bridge quotes', () => {
      expect(() => assertIsQuoteAndPost(bridgeQuote)).toThrow(
        'Quote result is not of type QuoteAndPost. Are you sure the sell and buy chains are the same?',
      )
    })
  })
})

describe('App data utilities', () => {
  describe('getPostHooks', () => {
    it('should return empty array for undefined app data', () => {
      expect(getPostHooks(undefined)).toEqual([])
    })

    it('should return empty array for invalid JSON', () => {
      expect(getPostHooks('invalid-json')).toEqual([])
    })

    it('should return empty array for non-app-doc data', () => {
      expect(getPostHooks(JSON.stringify({ foo: 'bar' }))).toEqual([])
    })

    it('should return empty array when metadata.hooks is undefined', () => {
      const appData = {
        version: '1.0',
        metadata: {},
      }
      expect(getPostHooks(JSON.stringify(appData))).toEqual([])
    })

    it('should return empty array when post hooks are undefined', () => {
      const appData = {
        version: '1.0',
        metadata: {
          hooks: {},
        },
      }
      expect(getPostHooks(JSON.stringify(appData))).toEqual([])
    })

    it('should return post hooks when present', () => {
      const hooks = [{ some: 'hook' }]
      const appData = {
        version: '1.0',
        metadata: {
          hooks: {
            post: hooks,
          },
        },
      }
      expect(getPostHooks(JSON.stringify(appData))).toEqual(hooks)
    })
  })

  describe('isAppDoc', () => {
    it('should return false for null', () => {
      expect(isAppDoc(null)).toBe(false)
    })

    it('should return false for non-objects', () => {
      expect(isAppDoc('string')).toBe(false)
      expect(isAppDoc(123)).toBe(false)
      expect(isAppDoc(undefined)).toBe(false)
    })

    it('should return false for objects missing required properties', () => {
      expect(isAppDoc({})).toBe(false)
      expect(isAppDoc({ version: '1.0' })).toBe(false)
      expect(isAppDoc({ metadata: {} })).toBe(false)
    })

    it('should return true for valid app docs', () => {
      const validDoc = {
        version: '1.0',
        metadata: {},
      }
      expect(isAppDoc(validDoc)).toBe(true)
    })
  })
})
