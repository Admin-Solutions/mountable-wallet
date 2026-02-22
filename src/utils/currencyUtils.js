/**
 * Currency display utilities.
 *
 * The API returns a `symbol` field that may be either an ISO code ("GBP")
 * or a display sign ("£") depending on how the currency was configured.
 * These helpers normalise both cases into { sign, code } for the UI.
 */

// ISO code → display sign
const CODE_TO_SIGN = {
  GBP: '£', USD: '$', EUR: '€', JPY: '¥',
  CHF: 'Fr', CAD: 'C$', AUD: 'A$', NZD: 'NZ$',
  SGD: 'S$', HKD: 'HK$', SEK: 'kr', NOK: 'kr',
  DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft',
}

// Display sign → ISO code (reverse of above)
const SIGN_TO_CODE = Object.fromEntries(
  Object.entries(CODE_TO_SIGN).map(([code, sign]) => [sign, code])
)

// Gradient colours assigned by currency index
const COLORS = [
  'mw-from-blue-600 mw-to-blue-800',
  'mw-from-green-600 mw-to-green-800',
  'mw-from-indigo-600 mw-to-indigo-800',
  'mw-from-purple-600 mw-to-purple-800',
  'mw-from-orange-600 mw-to-orange-800',
  'mw-from-rose-600 mw-to-rose-800',
  'mw-from-teal-600 mw-to-teal-800',
]

/**
 * Given the `symbol` field from the API, returns { sign, code }.
 * Handles both ISO code input ("GBP" → { sign: "£", code: "GBP" })
 * and display sign input ("£" → { sign: "£", code: "GBP" }).
 */
export function parseCurrencySymbol(symbol) {
  if (!symbol) return { sign: '?', code: '???' }

  if (CODE_TO_SIGN[symbol]) return { sign: CODE_TO_SIGN[symbol], code: symbol }
  if (SIGN_TO_CODE[symbol]) return { sign: symbol, code: SIGN_TO_CODE[symbol] }

  // Unknown currency — use first char as sign, uppercased slice as code
  return { sign: symbol.charAt(0), code: symbol.toUpperCase().slice(0, 4) }
}

/**
 * Returns a Tailwind gradient class for a given index, cycling through
 * the predefined COLORS array.
 */
export function currencyColor(index) {
  return COLORS[index % COLORS.length]
}

/**
 * Transforms raw API currency objects (from GetCurrenciesForAnAccountingEntity)
 * into the normalised shape consumed by WalletPage UI components.
 *
 * Raw shape:  { currencyGuid, symbol, isNativeCurrency, decimalPlaces,
 *               practicalDecimalPlaces, balance }
 * Output shape: { id, sign, code, balance, decimalPlaces, isNativeCurrency, color }
 */
export function normalizeCurrencies(apiCurrencies) {
  if (!Array.isArray(apiCurrencies)) return []
  return apiCurrencies.map((c, i) => {
    const { sign, code } = parseCurrencySymbol(c.symbol)
    return {
      id: c.currencyGuid,
      sign,
      code,
      balance: c.balance ?? 0,
      decimalPlaces: c.practicalDecimalPlaces ?? c.decimalPlaces ?? 2,
      isNativeCurrency: Boolean(c.isNativeCurrency),
      color: currencyColor(i),
    }
  })
}
