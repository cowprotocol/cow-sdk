// Type declarations for external dependencies which did not provide one

// Type declaration for https://www.npmjs.com/package/ipfs-only-hash
declare module 'ipfs-only-hash' {
  export function of(
    content: string | Buffer,
    // Full list of options https://github.com/ipfs-inactive/js-ipfs-unixfs-importer#const-import--importersource-ipld--options=
    options?: {
      cidVersion: 0 | 1
    }
  ): Promise<string>
}
