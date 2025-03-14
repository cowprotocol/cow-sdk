const ACROSS_API_URL = 'https://app.across.to/api'

export type AcrossQuoteRequest = {
  originChainId: number
  destinationChainId: number
  inputToken: string
  outputToken: string
}

export async function getAcrossQuote(
  params: AcrossQuoteRequest,
  inputAmount: bigint,
  recipient: string,
  { apiBaseUrl = ACROSS_API_URL }: { apiBaseUrl?: string }
) {
  const { inputToken, originChainId, destinationChainId } = params
  const url = `${ACROSS_API_URL}/suggested-fees?token=${inputToken}&originChainId=${originChainId}&destinationChainId=${destinationChainId}&amount=${inputAmount}&recipient=${recipient}`

  return fetch(url).then((res) => res.json())
}
