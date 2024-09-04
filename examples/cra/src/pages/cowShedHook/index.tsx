import '../../pageStyles.css'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { CowShedHooks } from '@cowprotocol/cow-sdk'
import { useCurrentChainId } from 'hooks/useCurrentChainId'
import { useWeb3Info } from 'hooks/useWeb3Info'
import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'
import { formatBytes32String } from 'ethers/lib/utils.js'
import { SigningScheme } from '@cowprotocol/contracts'

const DEADLINE = BigInt(1_000_000)

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

  const [cowShed, setCowShed] = useState<CowShedHooks>()
  const [input, setInput] = useState<IInput>()
  const [output, setOutput] = useState<string>()

  useEffect(() => {
    if (!chainId) return
    setCowShed(new CowShedHooks(chainId))
  }, [chainId])

  const generateHook = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()

      if (!input) return
      if (!cowShed) return

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

        console.log('calls', calls)
        const signature = await cowShed.signCalls(calls, nonce, DEADLINE, signer, SigningScheme.EIP712)

        setOutput('Building hook...')

        const hookCallData = cowShed.encodeExecuteHooksForFactory(calls, nonce, DEADLINE, account, signature)

        setOutput(hookCallData)
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
