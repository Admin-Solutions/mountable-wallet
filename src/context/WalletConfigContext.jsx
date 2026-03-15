import { createContext, useContext, useMemo } from 'react'

const WalletConfigContext = createContext(null)

export function WalletConfigProvider({ config, children }) {
  const value = useMemo(() => ({
    walletName: config.walletName || 'User',
    apiBaseUrl: config.apiBaseUrl || 'https://seemynft.page',
    theme: config.theme || 'dark',
    onAuthError: config.onAuthError,
    onTransactionComplete: config.onTransactionComplete,
    onBalanceChange: config.onBalanceChange,
  }), [config])

  return (
    <WalletConfigContext.Provider value={value}>
      {children}
    </WalletConfigContext.Provider>
  )
}

export function useWalletConfig() {
  const ctx = useContext(WalletConfigContext)
  if (!ctx) {
    throw new Error('useWalletConfig must be used within WalletConfigProvider')
  }
  return ctx
}

export default WalletConfigContext
