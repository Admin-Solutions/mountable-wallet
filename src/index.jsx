import { createRoot } from 'react-dom/client'
import { MountableWallet } from './MountableWallet'
// CSS is processed by @tailwindcss/vite and injected into the bundle by
// vite-plugin-css-injected-by-js — no manual ?inline handling needed.
import './styles/index.css'

// Store active instances for cleanup
const instances = new Map()

/**
 * Mount the wallet component to a container
 * @param {string|HTMLElement} selector - CSS selector or DOM element
 * @param {object} config - Configuration options
 * @returns {object} Controller object with refresh, updateConfig, unmount methods
 */
export function mount(selector, config = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector

  if (!container) {
    throw new Error(`MountableWallet: Container not found: ${selector}`)
  }

  // Apply custom theme CSS variables if provided
  if (config.customTheme) {
    Object.entries(config.customTheme).forEach(([key, value]) => {
      container.style.setProperty(key, value)
    })
  }

  const root = createRoot(container)
  let currentConfig = { ...config }

  const render = (cfg) => {
    root.render(<MountableWallet config={cfg} />)
  }

  render(currentConfig)

  const controller = {
    refresh: () => {
      container.dispatchEvent(new CustomEvent('mw-wallet-refresh'))
    },

    updateConfig: (newConfig) => {
      currentConfig = { ...currentConfig, ...newConfig }
      render(currentConfig)
    },

    unmount: () => {
      root.unmount()
      instances.delete(container)
    },

    getConfig: () => ({ ...currentConfig }),
  }

  instances.set(container, controller)
  return controller
}

/**
 * Unmount all wallet instances
 */
export function unmountAll() {
  instances.forEach((controller) => {
    controller.unmount()
  })
  instances.clear()
}

// Export React components for direct usage in React apps
export { MountableWallet } from './MountableWallet'
export { WalletConfigProvider, useWalletConfig } from './context/WalletConfigContext'
export { WalletPage } from './components/WalletPage'

// UMD global for script tag usage
if (typeof window !== 'undefined') {
  window.MountableWallet = {
    mount,
    unmountAll,
  }
}
