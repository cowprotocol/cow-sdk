export const getCacheKey = ({
  id,
  buyChainId,
  sellChainId = 'noSellChainID',
  tokenAddress = 'noTokenAddress',
}: {
  id: string
  buyChainId: string
  sellChainId?: string
  tokenAddress?: string
}) => {
  return `${id}-${buyChainId}-${sellChainId}-${tokenAddress.toLowerCase()}`
}
