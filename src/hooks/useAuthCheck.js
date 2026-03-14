import { useCallback } from 'react'
import { universalPost } from '../api/universalApi'
import { useWalletConfig } from '../context/WalletConfigContext'

const ENDPOINT_AUTH_CHECK = '186795a5-fc53-4a1e-9bf3-273c8a3ad895'
const MAX_AUTH_AGE_MINUTES = 30

/**
 * Returns a `checkAuth` function that performs the same pre-flight auth-age
 * check as nexus-ui's handleOpenSendFunds / handleOpenAddFunds.
 *
 * Optimistic: if the endpoint fails or returns no date, the check passes.
 * Only blocks when auth age > 30 minutes is positively confirmed.
 *
 * @returns {{ checkAuth: () => Promise<boolean> }}
 *   checkAuth resolves true  → auth is fresh, proceed
 *   checkAuth resolves false → auth is stale, onAuthError was called, block
 */
export function useAuthCheck() {
  const { apiBaseUrl, authToken, onAuthError } = useWalletConfig()

  const checkAuth = useCallback(async () => {
    try {
      const { value } = await universalPost(
        apiBaseUrl,
        ENDPOINT_AUTH_CHECK,
        {},
        authToken
      )
      const authDate = value?.[0]?.walletAuthDateCreated
      if (authDate) {
        const ageMinutes = (Date.now() - new Date(authDate + 'Z').getTime()) / 60000
        if (ageMinutes > MAX_AUTH_AGE_MINUTES) {
          onAuthError?.()
          return false
        }
      }
    } catch {
      // Optimistic — let through on error
    }
    return true
  }, [apiBaseUrl, authToken, onAuthError])

  return { checkAuth }
}
