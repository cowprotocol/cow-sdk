import GPv2SettlementAbi from './GPv2Settlement.json'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const SETTLEMENT_CONTRACT_ADDRESS = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'

export const SETTLEMENT_CONTRACT_ABI = GPv2SettlementAbi

export const SAFE_TRANSACTION_SERVICE_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'https://safe-transaction-mainnet.safe.global',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://safe-transaction-gnosis-chain.safe.global',
  [SupportedChainId.SEPOLIA]: 'https://safe-transaction-sepolia.safe.global',
  [SupportedChainId.ARBITRUM_ONE]: 'https://safe-transaction-arbitrum.safe.global',
}
