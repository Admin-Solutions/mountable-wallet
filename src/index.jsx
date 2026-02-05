import { createRoot } from 'react-dom/client'
import { MountableWallet } from './MountableWallet'
import './styles/index.css'

// Store active instances for cleanup
const instances = new Map()

// Track if styles have been injected
let stylesInjected = false

/**
 * Inject styles into the document if not already present
 */
function injectStyles() {
  if (stylesInjected) return
  // Styles are bundled with the JS, so they auto-inject via Vite
  stylesInjected = true
}

/**
 * Mount the wallet component to a container
 * @param {string|HTMLElement} selector - CSS selector or DOM element
 * @param {object} config - Configuration options
 * @returns {object} Controller object with refresh, updateConfig, unmount methods
 */
export function mount(selector, config = {}) {
  injectStyles()

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

  // Create controller object
  const controller = {
    /**
     * Refresh wallet data
     */
    refresh: () => {
      container.dispatchEvent(new CustomEvent('mw-wallet-refresh'))
    },

    /**
     * Update configuration and re-render
     * @param {object} newConfig - New configuration to merge
     */
    updateConfig: (newConfig) => {
      currentConfig = { ...currentConfig, ...newConfig }
      render(currentConfig)
    },

    /**
     * Unmount the wallet component
     */
    unmount: () => {
      root.unmount()
      instances.delete(container)
    },

    /**
     * Get current configuration
     */
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
