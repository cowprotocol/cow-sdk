import { useContext } from 'react'
import { ChainIdContext } from '../context'

export function useCurrentChainId(): number {
  return useContext(ChainIdContext)
}
