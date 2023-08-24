import { providers } from 'ethers'
import { COMPOSABLE_COW_CONTRACT_ADDRESS, SupportedChainId } from '../common'
import { ComposableCoW, ComposableCoW__factory } from './generated'
import { ComposableCoWInterface } from './generated/ComposableCoW'

let iCcomposableCow: ComposableCoWInterface | undefined
let composableCow: ComposableCoW | undefined

export function getComposableCowInterface(): ComposableCoWInterface {
  if (!iCcomposableCow) {
    iCcomposableCow = ComposableCoW__factory.createInterface()
  }

  return iCcomposableCow
}

export function getComposableCow(chain: SupportedChainId, provider: providers.Provider) {
  if (!composableCow) {
    composableCow = ComposableCoW__factory.connect(COMPOSABLE_COW_CONTRACT_ADDRESS[chain], provider)
  }

  return composableCow
}
