import { tokensSelect } from './pageHtml'

const sendOrderText = 'Send order'

interface Actions {
  onFormReset(): void
  onGetQuote(): Promise<void>
  onConfirmOrder(): Promise<void>
  onSignAndSendOrder(): Promise<void>
}

export function pageActions(actions: Actions) {
  onFormReset(actions.onFormReset)
  onNetworkChange()
  onGetQuote(actions)
}

export function printResult(text: string) {
  const resultsEl = document.getElementById('results')! as HTMLTextAreaElement

  resultsEl.value = text
    .split('\n')
    .map((t) => t.trim())
    .join('\n')
}

function onFormReset(callback: () => void) {
  document.getElementById('form')?.addEventListener('change', () => {
    printResult('')

    document.getElementById('sendOrder').innerText = sendOrderText
    callback()
  })
}

function onNetworkChange() {
  document.getElementById('chainId').addEventListener('change', (event) => {
    const chainId = +(event.target as unknown as { value: string }).value

    document.getElementById('sellToken')!.parentElement.innerHTML = tokensSelect(chainId, 'sellToken')
    document.getElementById('buyToken')!.parentElement.innerHTML = tokensSelect(chainId, 'buyToken')
  })
}

function onGetQuote(actions: Actions) {
  const connectWallet = document.getElementById('connectWallet') as HTMLButtonElement

  connectWallet.addEventListener('click', async (event) => {
    event.preventDefault()

    try {
      const accounts: string[] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })

      if (accounts.length) {
        connectWallet.disabled = true
        connectWallet.innerText = 'Connected'
      }
    } catch (error) {
      printError(error)
    }
  })

  document.getElementById('getQuote').addEventListener('click', (event) => {
    event.preventDefault()

    printResult('Loading...')

    const sendOrderEl = document.getElementById('sendOrder')

    sendOrderEl.innerText = sendOrderText

    actions.onFormReset()

    actions
      .onGetQuote()
      .then(() => {
        const sendOrderEl = document.getElementById('sendOrder') as HTMLButtonElement

        sendOrderEl.style.display = 'inline-block'

        sendOrderEl.addEventListener('click', async (event) => {
          event.preventDefault()

          sendOrderEl.disabled = true
          sendOrderEl.innerText = 'Loading...'

          try {
            if (sendOrderEl.innerText === sendOrderText) {
              await actions.onConfirmOrder()

              sendOrderEl.innerText = 'Sign and send'
            } else {
              await actions.onSignAndSendOrder()

              sendOrderEl.innerText = sendOrderText
              sendOrderEl.style.display = 'none'
            }
          } catch (error) {
            printError(error)
          } finally {
            sendOrderEl.disabled = false
          }
        })
      })
      .catch((error) => {
        printError(error)
      })
  })
}

function printError(error: any) {
  printResult(JSON.stringify(error.body || error.message || error.toString(), null, 4))
}
