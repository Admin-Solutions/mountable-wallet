import { createRoot } from 'react-dom/client'
import { MountableWallet } from './MountableWallet'
import './styles/index.css'

/**
 * open(config) — the primary entry point.
 *
 * Creates its own DOM node on document.body, mounts the wallet overlay
 * (bottom sheet, backdrop, ledger picker, wallet view), and cleans up
 * automatically when the user closes it.
 *
 * Config options:
 *   walletName  {string}    Display name for the greeting (e.g. "Charles")
 *   apiBaseUrl  {string}    API host, e.g. 'https://seemynft.page'
 *   theme       {string}    'dark' (default)
 *   onClose     {function}  Called after wallet is dismissed
 *   onAuthError {function}  Called if an auth error occurs inside the wallet
 *
 * Returns { unmount } — call unmount() to force-close (e.g. on route change).
 */
export function open(config = {}) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const root = createRoot(div)

  const cleanup = () => {
    root.unmount()
    if (div.parentNode) div.parentNode.removeChild(div)
  }

  root.render(
    <MountableWallet
      config={config}
      onClose={() => {
        config.onClose?.()
        cleanup()
      }}
    />
  )

  return { unmount: cleanup }
}

/**
 * mount(container, config) — embeds the wallet into an existing container.
 * For use in React apps that want to manage the shell themselves.
 */
export function mount(selector, config = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector

  if (!container) {
    throw new Error(`MountableWallet: Container not found: ${selector}`)
  }

  const root = createRoot(container)
  let currentConfig = { ...config }

  const render = (cfg) => root.render(<MountableWallet config={cfg} onClose={cfg.onClose} />)
  render(currentConfig)

  return {
    updateConfig: (newConfig) => {
      currentConfig = { ...currentConfig, ...newConfig }
      render(currentConfig)
    },
    unmount: () => root.unmount(),
    getConfig: () => ({ ...currentConfig }),
  }
}

export function unmountAll() {
  // No-op when using open() — each instance cleans itself up.
  // Kept for backwards compat.
}

// Named exports for direct React usage
export { MountableWallet } from './MountableWallet'
export { WalletConfigProvider, useWalletConfig } from './context/WalletConfigContext'
export { WalletPage } from './components/WalletPage'

// Global for CDN script-tag usage
if (typeof window !== 'undefined') {
  window.MountableWallet = { open, mount, unmountAll }
}
