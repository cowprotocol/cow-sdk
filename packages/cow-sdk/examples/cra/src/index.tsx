import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { ExternalProvider } from '@ethersproject/providers'
import { Buffer } from 'buffer'

window.Buffer = Buffer

declare global {
  interface Window {
    ethereum: ExternalProvider
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
