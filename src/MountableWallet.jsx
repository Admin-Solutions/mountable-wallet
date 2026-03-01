import { WalletConfigProvider } from './context/WalletConfigContext'
import { WalletPage } from './components/WalletPage'

/**
 * Root component for the mountable wallet
 * Wraps WalletPage with necessary providers
 */
export function MountableWallet({ config }) {
  return (
    <WalletConfigProvider config={config}>
      <div className="mw-wallet-root h-full overflow-y-auto">
        <WalletPage />
      </div>
    </WalletConfigProvider>
  )
}

export default MountableWallet
