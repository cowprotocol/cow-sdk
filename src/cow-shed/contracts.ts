import { CoWShed__factory, CoWShedFactory__factory } from '../common/generated'
import { CoWShedInterface } from '../common/generated/CoWShed'
import { CoWShedFactoryInterface } from '../common/generated/CoWShedFactory'

let cowShedInterfaceCache: CoWShedInterface | undefined
let cowShedFactoryInterface: CoWShedFactoryInterface | undefined

export function getCoWShedInterface(): CoWShedInterface {
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
