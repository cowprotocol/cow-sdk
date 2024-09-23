import { CoWShedInterface } from 'src/common/generated/CoWShed'
import { CoWShed__factory, CoWShedFactory__factory } from 'src/common/generated'
import { CoWShedFactoryInterface } from 'src/common/generated/CoWShedFactory'

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
