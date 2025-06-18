declare module 'multiformats/bases/base16' {
  export const base16: {
    encode: (bytes: Uint8Array) => string
    decode: (str: string) => Uint8Array
  }
}

declare module 'multiformats/cid' {
  export interface CID {
    toString(): string
    toV1(): CID
    toV0(): CID
    bytes: Uint8Array
    version: number
    code: number
    multihash: Uint8Array
    multibaseName: string
  }

  export function create(version: number, code: number, multihash: Uint8Array): CID
  export function parse(cid: string | Uint8Array): CID
}
