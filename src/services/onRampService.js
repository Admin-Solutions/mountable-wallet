import { universalPost } from '../api/universalApi'

const ENDPOINT = '530ba997-f7b0-4f71-9d5a-2776b7fa9116'

/**
 * Returns on-ramp methods available for a given currency.
 * Pass currencyRaid = 0 to return all currencies.
 */
export async function getOnRampsForCurrency(apiBaseUrl, currencyRaid = 0) {
  const { value } = await universalPost(apiBaseUrl, ENDPOINT, {
    '@FilterCurrencyRAID': currencyRaid,
  })
  return value ?? []
}
