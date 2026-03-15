import { universalPost } from '../api/universalApi'

const ENDPOINT = '080b1ef1-1345-4c26-8687-9dd73873cd9f'

/**
 * Fetch all accounting entities (ledgers) for the current user.
 * Auth is handled via cookies — no token needed.
 *
 * Returns the raw value array from the Universal API.
 * Each item: { accountingEntityGuid, accountingEntityName, percentageOwnership, ... }
 *
 * @param {string} apiBaseUrl - e.g. 'https://seemynft.page'
 * @returns {Promise<Array>}
 */
export async function getAccountingEntities(apiBaseUrl) {
  const { value } = await universalPost(apiBaseUrl, ENDPOINT, {})
  return value
}
