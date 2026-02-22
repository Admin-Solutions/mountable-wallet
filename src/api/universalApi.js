/**
 * Generic Universal API client for the mountable wallet.
 *
 * Flexible by design — accepts any EndPointGUID and any additionalPayload,
 * so the same client can be reused for wallets, tokens, accounting, etc.
 */

/**
 * POST to the Universal API gateway.
 *
 * @param {string} apiBaseUrl    - e.g. 'https://seemynft.page'
 * @param {string} endpointGuid  - The EndPointGUID for the SP to invoke
 * @param {object} additionalPayload - Key/value pairs forwarded as @params
 * @param {string} [authToken]   - Bearer token from bootstrap (matches nexus-ui interceptor)
 * @returns {Promise<{ action: Array, value: Array }>}
 */
export async function universalPost(apiBaseUrl, endpointGuid, additionalPayload = {}, authToken = null) {
  const url = `${apiBaseUrl}/api/universalapi/process`

  const headers = { 'Content-Type': 'application/json' }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ EndPointGUID: endpointGuid, additionalPayload }),
  })

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  // Normalize both wrapped (dataPayload) and direct response shapes
  const payload = data.dataPayload ?? data
  const action = payload.action ?? []
  const value = payload.value ?? []

  // Validate the response belongs to the caller
  const responseGuid = action[0]?.valueType
  if (responseGuid && responseGuid !== endpointGuid) {
    throw new Error(`Response GUID mismatch: expected ${endpointGuid}, got ${responseGuid}`)
  }

  return { action, value }
}
