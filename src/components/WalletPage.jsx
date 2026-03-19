import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ArrowLeftRight,
  PieChart,
  MoreHorizontal,
  Send,
  Download,
  History,
  ChevronDown,
  Search,
  Check,
  Building2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react'
import { useWalletConfig } from '../context/WalletConfigContext'
import { openAddFundsModal } from './AddFundsModal'
import { getOnRampsForCurrency } from '../services/onRampService'
import { getCurrencyBalances } from '../services/balanceService'
import { getAccountingEntities } from '../services/accountingEntityService'
import { normalizeCurrencies } from '../utils/currencyUtils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPct(p) {
  const pct = p <= 1 ? p * 100 : p
  return pct.toFixed(2).replace(/\.00$/, '') + '%'
}

function totalOwnershipPct(entities) {
  return entities.reduce((sum, e) => {
    const pct = e.percentageOwnership <= 1 ? e.percentageOwnership * 100 : e.percentageOwnership
    return sum + pct
  }, 0)
}

// ─── Ledger Dropdown ──────────────────────────────────────────────────────────

function LedgerDropdown({ entities, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const count = entities.length
  const pct = selected ? fmtPct(selected.percentageOwnership) : ''

  // Single entity — just a static label, no dropdown needed
  if (count === 1) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs text-wallet-text-muted">1 ledger</span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl mw-glass-card text-sm">
          <Building2 className="w-3.5 h-3.5 text-wallet-accent" />
          <span className="font-medium truncate max-w-[120px]">{selected?.accountingEntityName}</span>
          <span className="text-wallet-text-muted">{pct}</span>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative flex flex-col items-end gap-0.5">
      <span className="text-xs text-wallet-text-muted">{count} ledgers — tap to switch</span>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl mw-glass-card hover:bg-wallet-surface-hover transition-colors text-sm font-medium"
      >
        <Building2 className="w-3.5 h-3.5 text-wallet-accent" />
        <span className="max-w-[110px] truncate">{selected?.accountingEntityName ?? 'Select'}</span>
        {pct && <span className="text-wallet-text-muted">{pct}</span>}
        <ChevronDown className={`w-4 h-4 text-wallet-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 mw-glass-card rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-xs text-wallet-text-muted font-medium uppercase tracking-wider">
              {count} Ledgers
            </p>
          </div>
          {entities.map((entity) => {
            const isSelected = selected?.accountingEntityGuid === entity.accountingEntityGuid
            return (
              <button
                key={entity.accountingEntityGuid}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => { onSelect(entity); setOpen(false) }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-wallet-surface-hover transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-white truncate">{entity.accountingEntityName}</p>
                  <p className="text-xs text-wallet-text-muted">{fmtPct(entity.percentageOwnership)} ownership</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-wallet-accent flex-shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Currency Cards ───────────────────────────────────────────────────────────

function CurrencyCard({ currency, isSelected, onClick }) {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency.decimalPlaces ?? 0,
  }).format(currency.balance)

  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all text-left ${
        isSelected ? 'bg-wallet-accent/20 border border-wallet-accent/50' : 'mw-glass-card hover:bg-wallet-surface-hover'
      }`}
    >
      <p className="text-sm font-semibold text-white">{currency.name}</p>
      <p className="text-sm text-wallet-text-muted tabular-nums">{formatted}</p>
    </button>
  )
}

function MainCard({ currency }) {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency.decimalPlaces ?? 0,
    maximumFractionDigits: currency.decimalPlaces ?? 0,
  }).format(currency.balance)

  return (
    <motion.div
      key={currency.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currency.color} p-6 shadow-xl`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="relative z-10">
        <p className="text-white text-2xl font-bold mb-1">{currency.name}</p>
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">Available Balance</p>
        <p className="text-4xl sm:text-5xl font-bold text-white tabular-nums">{formatted}</p>
      </div>
    </motion.div>
  )
}

// ─── Currency Dropdown ────────────────────────────────────────────────────────

function CurrencyDropdown({ currencies, selectedCurrency, onSelect, loading }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const inputRef = useRef(null)

  const filtered = query.trim()
    ? currencies.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : currencies

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const formatBalance = (c) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: c.decimalPlaces ?? 0,
    }).format(c.balance)

  return (
    <div ref={ref} className="relative mb-6">
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((o) => !o)}
        disabled={loading || currencies.length === 0}
        className="w-full flex items-center justify-between px-4 py-3 mw-glass-card hover:bg-wallet-surface-hover transition-colors rounded-xl disabled:opacity-50"
      >
        <div className="text-left min-w-0">
          {loading ? (
            <span className="text-wallet-text-muted text-sm">Loading…</span>
          ) : selectedCurrency ? (
            <>
              <p className="text-sm font-semibold text-white truncate">{selectedCurrency.name}</p>
              <p className="text-xs text-wallet-text-muted tabular-nums">{formatBalance(selectedCurrency)}</p>
            </>
          ) : (
            <span className="text-wallet-text-muted text-sm">No currencies</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-wallet-text-muted flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 mw-glass-card rounded-xl overflow-hidden shadow-xl">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
            <Search className="w-4 h-4 text-wallet-text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currencies…"
              className="flex-1 bg-transparent text-sm text-white placeholder-wallet-text-muted outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-wallet-text-muted">No results</li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => { onSelect(c); setOpen(false); setQuery('') }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-wallet-surface-hover transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.name}</p>
                      <p className="text-xs text-wallet-text-muted tabular-nums">{formatBalance(c)}</p>
                    </div>
                    {selectedCurrency?.id === c.id && (
                      <Check className="w-4 h-4 text-wallet-accent flex-shrink-0 ml-2" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── WalletPage ────────────────────────────────────────────────────────────────

export function WalletPage() {
  const { walletName, apiBaseUrl } = useWalletConfig()

  const [entities, setEntities] = useState([])
  const [entitiesLoading, setEntitiesLoading] = useState(true)
  const [entitiesError, setEntitiesError] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState(null)

  const [currencies, setCurrencies] = useState([])
  const [currenciesLoading, setCurrenciesLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(null)

  const [allOnRampCurrencies, setAllOnRampCurrencies] = useState([])

  useEffect(() => {
    getOnRampsForCurrency(apiBaseUrl, 0)
      .then((raw) => {
        const seen = new Set()
        const unique = []
        for (const item of raw) {
          const key = item.currencyGuid?.toLowerCase()
          if (key && !seen.has(key)) {
            seen.add(key)
            unique.push({ guid: item.currencyGuid, name: item.currencyName, symbol: item.symbol, raid: item.currencyId })
          }
        }
        setAllOnRampCurrencies(unique)
      })
      .catch(() => {})
  }, [apiBaseUrl])

  useEffect(() => {
    setEntitiesLoading(true)
    setEntitiesError(null)
    getAccountingEntities(apiBaseUrl)
      .then((raw) => {
        const list = raw ?? []
        setEntities(list)
        if (list.length > 0) setSelectedEntity(list[0])
      })
      .catch((err) => setEntitiesError(err.message || 'Failed to load ledgers'))
      .finally(() => setEntitiesLoading(false))
  }, [apiBaseUrl])

  useEffect(() => {
    if (!selectedEntity?.accountingEntityGuid) return
    setCurrencies([])
    setSelectedCurrency(null)
    setCurrenciesLoading(true)
    getCurrencyBalances(selectedEntity.accountingEntityGuid, apiBaseUrl)
      .then((raw) => {
        const normalized = normalizeCurrencies(raw)
        setCurrencies(normalized)
        setSelectedCurrency(normalized[0] ?? null)
      })
      .catch((err) => console.error('[WalletPage] currencies:', err))
      .finally(() => setCurrenciesLoading(false))
  }, [selectedEntity, apiBaseUrl])

  const ownershipOk = entities.length === 0 || Math.abs(totalOwnershipPct(entities) - 100) < 0.1

  const [addFundsLoading, setAddFundsLoading] = useState(false)
  const [addFundsError, setAddFundsError] = useState(null)
  const [showReauthPrompt, setShowReauthPrompt] = useState(false)

  // Always points to the latest handleAddFunds — avoids stale closure in the event listener
  const handleAddFundsRef = useRef(null)
  const pendingAddFundsAfterLogin = useRef(false)

  // Listen for mw:loginComplete dispatched by LazyWallet when authVersion changes.
  // Also re-fetch entities so ledgers refresh when the user logs in on another tab.
  useEffect(() => {
    const handler = () => {
      // Re-fetch entities so ledgers are correct for the newly-authed session
      setEntitiesLoading(true)
      setEntitiesError(null)
      getAccountingEntities(apiBaseUrl)
        .then((raw) => {
          const list = raw ?? []
          setEntities(list)
          if (list.length > 0) setSelectedEntity(list[0])
        })
        .catch((err) => setEntitiesError(err.message || 'Failed to load ledgers'))
        .finally(() => setEntitiesLoading(false))

      if (pendingAddFundsAfterLogin.current) {
        pendingAddFundsAfterLogin.current = false
        handleAddFundsRef.current?.()
      }
    }
    window.addEventListener('mw:loginComplete', handler)
    return () => window.removeEventListener('mw:loginComplete', handler)
  }, [apiBaseUrl])

  // Update the currency balance when a payment completes
  useEffect(() => {
    const handler = (e) => {
      const { amountFunded, currencyRAID } = e.detail ?? {}
      if (!amountFunded || !currencyRAID) return
      // eslint-disable-next-line eqeqeq
      const matches = (c) => c.raid == currencyRAID // loose equality handles string/number mismatch
      setCurrencies((prev) => prev.map((c) =>
        matches(c) ? { ...c, balance: (c.balance ?? 0) + amountFunded } : c
      ))
      setSelectedCurrency((prev) =>
        prev && matches(prev) ? { ...prev, balance: (prev.balance ?? 0) + amountFunded } : prev
      )
    }
    window.addEventListener('nexus:fundsAdded', handler)
    return () => window.removeEventListener('nexus:fundsAdded', handler)
  }, [])

  const launchLogin = () => {
    setShowReauthPrompt(false)
    pendingAddFundsAfterLogin.current = true
    window.dispatchEvent(new CustomEvent('mw:requireLogin'))
  }

  const handleAddFunds = async () => {
    if (!selectedCurrency || !selectedEntity || !ownershipOk) return
    setAddFundsLoading(true)
    setAddFundsError(null)

    // Pre-flight stale auth check — same pattern as NexusLayout handleOpenAddFunds
    try {
      const res = await fetch(`${apiBaseUrl}/api/universalApi/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ EndPointGUID: '186795a5-fc53-4a1e-9bf3-273c8a3ad895' }),
      })
      if (res.ok) {
        const data = await res.json()
        const payload = data?.dataPayload || data
        const result = (payload?.value || [])[0] || {}
        const authDate = result.walletAuthDateCreated
        if (authDate) {
          const ageMinutes = (Date.now() - new Date(authDate + 'Z').getTime()) / 60000
          if (ageMinutes > 30) {
            setShowReauthPrompt(true)
            setAddFundsLoading(false)
            return
          }
        }
      }
    } catch {
      // Network error → proceed anyway
    }

    try {
      const methods = await getOnRampsForCurrency(apiBaseUrl, selectedCurrency.raid ?? 0)
      if (!methods.length) {
        setAddFundsError(`No funding methods available for ${selectedCurrency.name}`)
        setTimeout(() => setAddFundsError(null), 5000)
        return
      }
      openAddFundsModal({
        currency: selectedCurrency,
        entityGuid: selectedEntity.accountingEntityGuid,
        entityName: selectedEntity.accountingEntityName,
      })
    } catch (err) {
      setAddFundsError('Failed to load funding methods')
      setTimeout(() => setAddFundsError(null), 5000)
    } finally {
      setAddFundsLoading(false)
    }
  }

  // Keep the ref current every render so the mw:loginComplete handler always calls the latest version
  handleAddFundsRef.current = handleAddFunds

  const existingGuids = new Set(currencies.map(c => c.id?.toLowerCase()))
  const discoverCurrencies = allOnRampCurrencies.filter(c => !existingGuids.has(c.guid?.toLowerCase()))

  const handleAddFundsForNewCurrency = async (currency) => {
    if (!selectedEntity || !ownershipOk) return
    setAddFundsLoading(true)
    setAddFundsError(null)
    try {
      const res = await fetch(`${apiBaseUrl}/api/universalApi/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ EndPointGUID: '186795a5-fc53-4a1e-9bf3-273c8a3ad895' }),
      })
      if (res.ok) {
        const data = await res.json()
        const payload = data?.dataPayload || data
        const result = (payload?.value || [])[0] || {}
        const authDate = result.walletAuthDateCreated
        if (authDate) {
          const ageMinutes = (Date.now() - new Date(authDate + 'Z').getTime()) / 60000
          if (ageMinutes > 30) {
            setShowReauthPrompt(true)
            setAddFundsLoading(false)
            return
          }
        }
      }
    } catch { }
    try {
      openAddFundsModal({
        currency: { id: currency.guid, name: currency.name, symbol: currency.symbol, raid: currency.raid },
        entityGuid: selectedEntity.accountingEntityGuid,
        entityName: selectedEntity.accountingEntityName,
      })
    } catch {
      setAddFundsError('Failed to open funding methods')
      setTimeout(() => setAddFundsError(null), 5000)
    } finally {
      setAddFundsLoading(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const actions = [
    { icon: Plus,           label: 'Add',     color: 'bg-green-500/20 text-green-400',   onClick: handleAddFunds },
    { icon: ArrowLeftRight, label: 'Move',    color: 'bg-blue-500/20 text-blue-400' },
    { icon: PieChart,       label: 'Reports', color: 'bg-purple-500/20 text-purple-400' },
    { icon: MoreHorizontal, label: 'More',    color: 'bg-gray-500/20 text-gray-400' },
  ]

  return (
    <>
    {/* Stale auth prompt */}
    <AnimatePresence>
      {showReauthPrompt && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
            onClick={() => setShowReauthPrompt(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-5 pointer-events-none"
          >
            <div style={{
              backgroundColor: 'var(--mw-bg-secondary)',
              border: '1px solid var(--mw-surface-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '24rem',
              pointerEvents: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
            }}>
              <div className="flex flex-col items-center text-center gap-4">
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: 'color-mix(in srgb, var(--mw-accent) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--mw-accent) 25%, transparent)',
                }}>
                  <Lock style={{ width: 24, height: 24, color: 'var(--mw-accent)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--mw-text-primary)', marginBottom: '0.5rem' }}>Login required</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--mw-text-muted)', lineHeight: 1.6 }}>
                    Your login credentials are not recent enough. For your account protection, please login again to add funds.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', paddingTop: '0.25rem' }}>
                  <button
                    onClick={() => setShowReauthPrompt(false)}
                    style={{
                      flex: 1, padding: '0.625rem', borderRadius: '0.75rem',
                      border: '1px solid var(--mw-surface-border)',
                      fontSize: '0.875rem', color: 'var(--mw-text-muted)',
                      background: 'transparent', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={launchLogin}
                    style={{
                      flex: 1, padding: '0.625rem', borderRadius: '0.75rem',
                      background: 'var(--mw-accent)',
                      fontSize: '0.875rem', color: '#fff', fontWeight: 600,
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    <div className="h-full overflow-y-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-wallet-text-muted">{greeting()},</p>
            <h1 className="text-2xl font-bold">{walletName?.split(' ')[0] || 'User'}</h1>
          </div>
          {entitiesLoading ? (
            <Loader2 className="w-5 h-5 text-wallet-accent animate-spin mt-1" />
          ) : entitiesError ? (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Ledger error</span>
            </div>
          ) : (
            <LedgerDropdown entities={entities} selected={selectedEntity} onSelect={setSelectedEntity} />
          )}
        </div>

        {/* Currency selector */}
        <CurrencyDropdown
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelect={setSelectedCurrency}
          loading={entitiesLoading || currenciesLoading}
        />

        {/* Currency cards row */}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 mw-scrollbar-hide mb-6">
          {(entitiesLoading || currenciesLoading) && [0, 1, 2].map((i) => (
            <div key={i} className="flex-shrink-0 w-36 h-16 rounded-xl mw-glass-card animate-pulse" />
          ))}
          {!entitiesLoading && !currenciesLoading && currencies.map((currency) => (
            <CurrencyCard
              key={currency.id}
              currency={currency}
              isSelected={selectedCurrency?.id === currency.id}
              onClick={() => setSelectedCurrency(currency)}
            />
          ))}
        </div>

        {/* Main balance card */}
        <AnimatePresence mode="wait">
          {selectedCurrency ? (
            <MainCard key={selectedCurrency.id} currency={selectedCurrency} />
          ) : (
            <div key="skeleton" className="h-48 rounded-2xl mw-glass-card animate-pulse" />
          )}
        </AnimatePresence>

        {/* Ownership warning */}
        {!ownershipOk && entities.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 mb-6">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-300">Financial functions unavailable</p>
              <p className="text-xs text-orange-400/80 mt-0.5">
                Combined ledger ownership is {totalOwnershipPct(entities).toFixed(2)}% — must equal 100% to send, add, or move funds.
              </p>
            </div>
          </div>
        )}

        {/* Add funds error */}
        {addFundsError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 mt-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{addFundsError}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {actions.map((action) => {
            const Icon = action.icon
            const isAddLoading = action.label === 'Add' && addFundsLoading
            return (
              <button
                key={action.label}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={action.onClick}
                disabled={!ownershipOk || isAddLoading}
                className="flex flex-col items-center gap-2 p-4 mw-glass-card hover:bg-wallet-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className={`p-3 rounded-full ${action.color}`}>
                  {isAddLoading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Icon className="w-5 h-5" />
                  }
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            )
          })}
        </div>

        {/* Send / Request */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            disabled={!ownershipOk}
            className="flex items-center gap-3 p-4 mw-glass-card hover:bg-wallet-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="p-2 rounded-full bg-wallet-accent/20">
              <Send className="w-5 h-5 text-wallet-accent" />
            </div>
            <div className="text-left">
              <p className="font-medium">Send</p>
              <p className="text-sm text-wallet-text-muted">Transfer funds</p>
            </div>
          </button>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            disabled={!ownershipOk}
            className="flex items-center gap-3 p-4 mw-glass-card hover:bg-wallet-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="p-2 rounded-full bg-green-500/20">
              <Download className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-medium">Request</p>
              <p className="text-sm text-wallet-text-muted">Request payment</p>
            </div>
          </button>
        </div>

        {/* Recent activity */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-wallet-text-muted" />
            <h3 className="text-sm font-semibold text-wallet-text-muted uppercase tracking-wider">Recent Activity</h3>
          </div>
        </div>

        {/* Discover new currencies */}
        {discoverCurrencies.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-wallet-text-muted" />
              <h3 className="text-sm font-semibold text-wallet-text-muted uppercase tracking-wider">Explore Currencies</h3>
            </div>
            <div className="space-y-2">
              {discoverCurrencies.map((currency) => (
                <button
                  key={currency.guid}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleAddFundsForNewCurrency(currency)}
                  disabled={!ownershipOk || addFundsLoading}
                  className="w-full flex items-center gap-3 p-3 mw-glass-card hover:bg-wallet-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-wallet-accent/15 border border-wallet-accent/25 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-wallet-accent">{currency.symbol?.slice(0, 3) ?? '?'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{currency.name}</p>
                    <p className="text-xs text-wallet-text-muted">{currency.symbol}</p>
                  </div>
                  <div className="p-2 rounded-full bg-green-500/20 flex-shrink-0">
                    <Plus className="w-4 h-4 text-green-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  )
}

export default WalletPage
