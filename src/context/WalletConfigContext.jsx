import { createContext, useContext, useMemo } from 'react'

const WalletConfigContext = createContext(null)

/**
 * Provider for wallet configuration
 * Allows injecting auth, API settings, and callbacks
 */
export function WalletConfigProvider({ config, children }) {
  const value = useMemo(() => ({
    // Wallet identity
    walletGuid: config.walletGuid,
    walletName: config.walletName || 'User',

    // Accounting entity (ledger selected via Choose Ledger)
    accountingEntityGuid: config.accountingEntityGuid || null,

    // Authentication
    authToken: config.authToken,
    pmc: config.pmc,
    entityAuth: config.entityAuth,

    // API endpoints
    apiBaseUrl: config.apiBaseUrl || 'https://seemynft.page',
    websiteApiUrl: config.websiteApiUrl || 'https://website.admin.solutions',

    // Theme
    theme: config.theme || 'dark',

    // Callbacks
    onAuthError: config.onAuthError,
    onTransactionComplete: config.onTransactionComplete,
    onBalanceChange: config.onBalanceChange,

    // Initial data (for SSR or pre-loaded)
    initialData: config.initialData || null,
  }), [config])

  return (
    <WalletConfigContext.Provider value={value}>
      {children}
    </WalletConfigContext.Provider>
  )
}

/**
 * Hook to access wallet configuration
 */
export function useWalletConfig() {
  const ctx = useContext(WalletConfigContext)
  if (!ctx) {
    throw new Error('useWalletConfig must be used within WalletConfigProvider')
  }
  return ctx
}

export default WalletConfigContext
