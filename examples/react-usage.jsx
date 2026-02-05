/**
 * Example: Using MountableWallet in a React application
 *
 * Option 1: Using the React component directly (recommended for React apps)
 * Option 2: Using the imperative mount() API with useEffect
 */

import { useEffect, useRef } from 'react'

// Option 1: Direct React component usage
// import { MountableWallet, WalletConfigProvider, WalletPage } from '@admin-solutions/mountable-wallet'
// CSS is auto-injected, no import needed

export function WalletWithProvider() {
  const config = {
    walletGuid: 'your-wallet-guid',
    walletName: 'User Name',
    authToken: 'your-jwt-token',
    apiBaseUrl: 'https://seemynft.page',
    onAuthError: (error) => console.error('Auth error:', error),
  }

  return (
    <MountableWallet config={config} />
  )
}

// Option 2: Imperative mount with useEffect (for CDN usage in React)
export function WalletWithImperativeMount() {
  const containerRef = useRef(null)
  const walletRef = useRef(null)

  // Get auth from your app's context/state
  const authToken = 'your-jwt-token'
  const walletGuid = 'your-wallet-guid'

  useEffect(() => {
    // Check if MountableWallet is loaded (from CDN)
    if (window.MountableWallet && containerRef.current) {
      walletRef.current = window.MountableWallet.mount(containerRef.current, {
        walletGuid,
        walletName: 'User Name',
        authToken,
        apiBaseUrl: 'https://seemynft.page',
        onAuthError: (error) => {
          console.error('Wallet auth error:', error)
          // Handle auth error - maybe redirect to login
        },
      })
    }

    // Cleanup on unmount
    return () => {
      walletRef.current?.unmount()
    }
  }, [walletGuid, authToken])

  // Update config when auth changes
  useEffect(() => {
    if (walletRef.current) {
      walletRef.current.updateConfig({ authToken })
    }
  }, [authToken])

  return (
    <div
      ref={containerRef}
      style={{ minHeight: '100vh' }}
    />
  )
}

// Option 3: Embedding in nexus-ui
// This is how you'd integrate it back into the original nexus-ui app
export function EmbeddedWalletInNexus() {
  const containerRef = useRef(null)
  const walletRef = useRef(null)

  // Get auth from nexus-ui's AuthContext
  // const { authToken, walletGuid, pmc } = useAuth()

  // For demo purposes:
  const authToken = 'your-jwt-token'
  const walletGuid = 'your-wallet-guid'
  const pmc = 'page-monkey-code'

  useEffect(() => {
    if (window.MountableWallet && containerRef.current) {
      walletRef.current = window.MountableWallet.mount(containerRef.current, {
        walletGuid,
        walletName: 'Charlie Raffay',
        authToken,
        pmc,
        apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || 'https://seemynft.page',
        onAuthError: (error) => {
          console.error('Wallet auth error:', error)
        },
      })
    }

    return () => walletRef.current?.unmount()
  }, [walletGuid, authToken, pmc])

  return <div ref={containerRef} className="wallet-embed" />
}
