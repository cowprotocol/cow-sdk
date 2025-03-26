import '../../pageStyles.css'
import { FormEvent, useCallback, useState } from 'react'
import { CowShedSdk } from '@cowprotocol/cow-sdk'
import { useCurrentChainId } from 'hooks/useCurrentChainId'
import { useWeb3Info } from 'hooks/useWeb3Info'
import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'
import { formatBytes32String } from 'ethers/lib/utils.js'

const DEADLINE = BigInt(1_000_000)
const cowShedSdk = new CowShedSdk()
interface IInput {
  target: string
  value: number
  callData: string
  allowFailure: boolean
  isDelegateCall: boolean
}
export function GenerateCowShedHookCallDataPage() {
  const { account, provider } = useWeb3Info()
  const chainId = useCurrentChainId()

  const [input, setInput] = useState<IInput>()
  const [output, setOutput] = useState<string>()

  const generateHook = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()

      if (!input) return

      try {
        setOutput('Waiting signature...')

        const nonce = formatBytes32String(Date.now().toString())

        const signer = provider.getSigner()

        const calls = [
          {
            target: input.target,
            value: BigInt(input.value),
            callData: input.callData,
            allowFailure: input.allowFailure,
            isDelegateCall: input.isDelegateCall,
          },
        ]

        const cowShedCall = await cowShedSdk.signCalls({
          chainId,
          calls,
          nonce,
          deadline: DEADLINE,
          signer,
        })

        setOutput(JSON.stringify(cowShedCall, null, 2))
      } finally {
        setOutput('Error generating hook')
      }
    },
    [input]
  )

  const defaultValue = {
    target: '',
    value: 0,
    callData: '',
    allowFailure: false,
    isDelegateCall: true,
  }

  return (
    <div>
      <div className="form">
        <div>
          <h1>Hook data:</h1>
          <JsonContent defaultValue={defaultValue} onChange={setInput} />
        </div>

        <div>
          <button onClick={generateHook}>Generate hook</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
