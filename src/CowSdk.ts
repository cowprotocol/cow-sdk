import { version as SDK_VERSION } from '../package.json'
import { validateAppDataDocument } from './utils/appData'

export class CowSdk {
  static version = SDK_VERSION

  validateAppDataDocument = validateAppDataDocument
}

export default CowSdk
