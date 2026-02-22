import { universalPost } from '../api/universalApi'

// GetCurrenciesForAnAccountingEntity
const ENDPOINT_CURRENCIES = '7d777ccb-2ecb-4d4d-b1cb-69185a6016ae'

/**
 * Fetch all currencies and their current balances for an accounting entity.
 *
 * Returns the raw value array from the Universal API — call normalizeCurrencies()
 * from currencyUtils.js to transform it into UI-ready objects.
 *
 * @param {string} accountingEntityGuid
 * @param {string} apiBaseUrl   - e.g. 'https://seemynft.page'
 * @param {string} [authToken]  - Bearer token forwarded from wallet config
 * @returns {Promise<Array>}
 */
export async function getCurrencyBalances(accountingEntityGuid, apiBaseUrl, authToken) {
  const { value } = await universalPost(
    apiBaseUrl,
    ENDPOINT_CURRENCIES,
    { '@AccountingEntityGUID': accountingEntityGuid },
    authToken
  )
  return value
}
