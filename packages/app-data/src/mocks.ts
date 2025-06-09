export const HTTP_STATUS_OK = 200
export const HTTP_STATUS_INTERNAL_ERROR = 500

export const APP_DATA_DOC = {
  version: '0.7.0',
  appCode: 'CoW Swap',
  metadata: {},
}

export const APP_DATA_STRING = '{"appCode":"CoW Swap","metadata":{},"version":"0.7.0"}'
export const CID = 'f01551b20337aa6e6c2a7a0d1eb79a35ebd88b08fc963d5f7a3fc953b7ffb2b7f5898a1df' // https://cid.ipfs.tech/#f01551b20337aa6e6c2a7a0d1eb79a35ebd88b08fc963d5f7a3fc953b7ffb2b7f5898a1df
export const APP_DATA_HEX = '0x337aa6e6c2a7a0d1eb79a35ebd88b08fc963d5f7a3fc953b7ffb2b7f5898a1df'

export const APP_DATA_DOC_CUSTOM = {
  ...APP_DATA_DOC,
  environment: 'test',
  metadata: {
    referrer: {
      address: '0x1f5B740436Fc5935622e92aa3b46818906F416E9',
      version: '0.1.0',
    },
    quote: {
      slippageBips: 1,
      version: '0.2.0',
    },
  },
}

// Another example of AppData (same as the backend uses in the tests
// See https://github.com/cowprotocol/services/blob/main/crates/app-data-hash/src/lib.rs#L64
export const APP_DATA_STRING_2 =
  '{"appCode":"CoW Swap","environment":"production","metadata":{"quote":{"slippageBips":"50","version":"0.2.0"},"orderClass":{"orderClass":"market","version":"0.1.0"}},"version":"0.6.0"}'
export const CID_2 = 'f01551b208af4e8c9973577b08ac21d17d331aade86c11ebcc5124744d621ca8365ec9424' // https://cid.ipfs.tech/#f01551b208af4e8c9973577b08ac21d17d331aade86c11ebcc5124744d621ca8365ec9424
export const APP_DATA_HEX_2 = '0x8af4e8c9973577b08ac21d17d331aade86c11ebcc5124744d621ca8365ec9424'

// Legacy IPFS Hash format and AppData
export const APP_DATA_STRING_LEGACY = '{"version":"0.7.0","appCode":"CowSwap","metadata":{}}' // Slightly different than FULL_APP_DATA because legacy used undeterministic JSON.stringify while now we use stringifyDeterministic method
export const CID_LEGACY = 'QmSwrFbdFcryazEr361YmSwtGcN4uo4U5DKpzA4KbGxw4Q' // https://cid.ipfs.tech/#QmUbsYUqP4DXDvXDipKDG6hKhKnb6dADMeBiHHYJiizr25
export const APP_DATA_HEX_LEGACY = '0x447320af985c5e834321dc495545f764ad20d8397eeed2f4a2dcbee44a56b725'

export const PINATA_API_KEY = 'apikey'
export const PINATA_API_SECRET = 'apiSecret'
