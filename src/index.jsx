import { createRoot } from 'react-dom/client'
import { MountableWallet } from './MountableWallet'
// Import CSS as an inline string so we control exactly when it's injected into
// document.head, and can remove it cleanly when the last instance unmounts.
import walletCss from './styles/index.css?inline'

// Store active instances for cleanup
const instances = new Map()

// Shared <style> element for the wallet's bundled CSS.
// Created on first mount, removed when the last instance unmounts.
let sharedStyleEl = null

function isStyleNode(node) {
  return (
    node.nodeType === Node.ELEMENT_NODE &&
    (node.tagName === 'STYLE' ||
      (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet'))
  )
}

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

  // Inject the shared wallet CSS once (re-inject if it was removed by a previous unmount)
  if (!sharedStyleEl || !document.head.contains(sharedStyleEl)) {
    sharedStyleEl = document.createElement('style')
    sharedStyleEl.setAttribute('data-mw-styles', '')
    sharedStyleEl.textContent = walletCss
    document.head.appendChild(sharedStyleEl)
  }

  // Track any additional <style>/<link rel="stylesheet"> nodes that React or its
  // dependencies (e.g. framer-motion) inject into document.head during the first
  // render. sharedStyleEl is excluded because it is managed above.
  const renderInjectedStyles = []
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (isStyleNode(node) && node !== sharedStyleEl) {
          renderInjectedStyles.push(node)
        }
      }
    }
  })

  // Start observing BEFORE createRoot so any first-render CSS injections are captured
  observer.observe(document.head, { childList: true })
  const root = createRoot(container)
  let currentConfig = { ...config }

  const render = (cfg) => {
    root.render(<MountableWallet config={cfg} />)
  }

  render(currentConfig)

  // Disconnect after one microtask — all synchronous and Promise-scheduled
  // style injections from the first render will have been recorded by then
  Promise.resolve().then(() => observer.disconnect())

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
     * Unmount the wallet component and remove every style node it injected
     */
    unmount: () => {
      root.unmount()
      // Remove styles injected by React / runtime dependencies during first render
      renderInjectedStyles.forEach((el) => el.remove())
      renderInjectedStyles.length = 0
      instances.delete(container)
      // Remove the shared wallet CSS when the last instance unmounts
      if (instances.size === 0) {
        sharedStyleEl?.remove()
        sharedStyleEl = null
      }
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
