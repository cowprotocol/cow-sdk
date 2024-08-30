import { CoWShed__factory, CoWShedFactory__factory } from '../common/generated'
import { CoWShedFactoryInterface } from 'src/common/generated/CoWShedFactory'

let cowShedInterfaceCache: CoWShedFactoryInterface | undefined
let cowShedFactoryInterface: CoWShedFactoryInterface | undefined

export function getCoWShedInterface(): CoWShedFactoryInterface {
  if (!cowShedInterfaceCache) {
    cowShedInterfaceCache = CoWShed__factory.createInterface()
  }

  return cowShedInterfaceCache
}

export function getCoWShedFactoryInterface(): CoWShedFactoryInterface {
  if (!cowShedFactoryInterface) {
    cowShedFactoryInterface = CoWShedFactory__factory.createInterface()
  }

  return cowShedFactoryInterface
}
