import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'

const UPSTREAM_COMMIT_HASH = '8c762559c98b707801f52dd070dd39ab9478b876'
const UPSTREAM_REPO = 'https://raw.githubusercontent.com/cowprotocol/composable-cow'
const ABI_TO_FETCH = ['ComposableCoW', 'ExtensibleFallbackHandler', 'TWAP']

const urlsToDownload = ABI_TO_FETCH.map((abi) => {
  return `${UPSTREAM_REPO}/${UPSTREAM_COMMIT_HASH}/out/${abi}.sol/${abi}.json`
})

const abiDir = path.join(__dirname, 'abi')

if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir)
}

function downloadFile(url: string, targetPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(targetPath)
    const request = https.get(url, (response) => {
      response.pipe(fileStream)
      fileStream.on('finish', () => {
        fileStream.close(() => resolve())
      })
    })

    request.on('error', (error) => {
      reject(error)
    })
  })
}

async function downloadAndMoveFiles(urls: string[]): Promise<void> {
  for (const url of urls) {
    const filename = path.basename(url)
    const targetPath = path.join(abiDir, filename)
    await downloadFile(url, targetPath)
    console.log(`File ${filename} downloaded and saved successfully.`)
  }
}

async function main() {
  await downloadAndMoveFiles(urlsToDownload)
}

main()
