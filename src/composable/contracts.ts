import { providers } from 'ethers'
import { COMPOSABLE_COW_CONTRACT_ADDRESS, SupportedChainId } from '../common'
import { ComposableCoW, ComposableCoW__factory } from './generated'

let composableCow: ComposableCoW | undefined
export function getComposableCow(chain: SupportedChainId, provider: providers.Provider) {
  if (!composableCow) {
    composableCow = ComposableCoW__factory.connect(COMPOSABLE_COW_CONTRACT_ADDRESS[chain], provider)
  }

  return composableCow
}
