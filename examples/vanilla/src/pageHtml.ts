import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '../../../src'
import { TOKENS } from './tokens'

const chainId = SupportedChainId.MAINNET

export const tokensSelect = (chainId: SupportedChainId, name: string) =>
  `<select name="${name}" id="${name}">
        ${TOKENS[chainId].map((token) => `<option value="${token.address}">${token.symbol}</option>`)}
      </select>`

export function pageHtml() {
  const page = document.createElement('div')

  const networksSelect = () =>
    `<select name="chainId" id="chainId">
        ${ALL_SUPPORTED_CHAIN_IDS.map((chainId) => `<option value="${chainId}">${chainId}</option>`)}
      </select>`

  page.innerHTML = `
    <table id="layout">
        <tr>
            <td>
                <form id="form">
                  <h3>Swap</h3>

                  <div>
                      <label for="privateKey">Private key</label>
                      <div><input name="privateKey" type="password"/></div>
                      <br/>
                      <span>or</span>
                      <button id="connectWallet">Connect wallet</button>
                  </div>

                  <div>
                      <label for="chainId">Network</label>
                      <div>${networksSelect()}</div>
                  </div>

                  <div>
                      <label for="sellToken">Sell token</label>
                      <div>${tokensSelect(chainId, 'sellToken')}</div>
                  </div>

                  <div>
                      <label for="sellToken">Buy token</label>
                      <div>${tokensSelect(chainId, 'buyToken')}</div>
                  </div>

                  <div>
                      <label for="amount">Amount</label>
                      <div><input name="amount" value="20"/></div>
                  </div>

                  <div>
                      <label for="slippageBps">Slippage (BPS)</label>
                      <div><input name="slippageBps" type="number"/></div>
                  </div>

                  <div>
                      <label for="kind">Type</label>
                      <div>
                          <select name="kind">
                              <option value="sell">Sell</option>
                              <option value="buy">Buy</option>
                          </select>
                      </div>
                  </div>

                  <div>
                    <button id="getQuote">Get quote</button>
                    <button id="sendOrder">Send order</button>
                  </div>
              </form>
            </td>
            <td>
                <h4>Result:</h4>
                <textarea id="results" disabled></textarea>
            </td>
          </tr>
    </table>
  `

  return page
}
