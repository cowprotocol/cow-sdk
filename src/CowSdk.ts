import { version as SDK_VERSION } from '../package.json'
import { validateAppDataDocument } from './utils/appData'
import { signOrder, signOrderCancellation } from './utils/sign'

export class CowSdk {
  static version = SDK_VERSION

  validateAppDataDocument = validateAppDataDocument
  signOrder = signOrder
  signOrderCancellation = signOrderCancellation
}

export default CowSdk
