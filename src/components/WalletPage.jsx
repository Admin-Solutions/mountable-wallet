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
} from 'lucide-react'
import { AccountingHub } from './accounting'
import { useWalletConfig } from '../context/WalletConfigContext'
import { getCurrencyBalances } from '../services/balanceService'
import { normalizeCurrencies } from '../utils/currencyUtils'

function CurrencyDropdown({ currencies, selectedCurrency, onSelect, loading, error }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const filtered = query.trim()
    ? currencies.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : currencies

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleSelect(currency) {
    onSelect(currency)
    setOpen(false)
    setQuery('')
  }

  const formatBalance = (c) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: c.decimalPlaces ?? 0,
    }).format(c.balance)

  return (
    <div ref={containerRef} className="mw-relative mw-mb-6">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading || !!error}
        className="mw-w-full mw-flex mw-items-center mw-justify-between mw-px-4 mw-py-3 mw-glass-card hover:mw-bg-wallet-surface-hover mw-transition-colors mw-rounded-xl disabled:mw-opacity-50"
      >
        <div className="mw-text-left mw-min-w-0">
          {loading ? (
            <span className="mw-text-wallet-text-muted mw-text-sm">Loading currencies…</span>
          ) : error ? (
            <span className="mw-text-red-400 mw-text-sm">{error}</span>
          ) : selectedCurrency ? (
            <>
              <p className="mw-text-sm mw-font-semibold mw-text-white mw-truncate">{selectedCurrency.name}</p>
              <p className="mw-text-xs mw-text-wallet-text-muted mw-tabular-nums">{formatBalance(selectedCurrency)}</p>
            </>
          ) : (
            <span className="mw-text-wallet-text-muted mw-text-sm">Select currency</span>
          )}
        </div>
        <ChevronDown
          className={`mw-w-4 mw-h-4 mw-text-wallet-text-muted mw-flex-shrink-0 mw-ml-2 mw-transition-transform ${open ? 'mw-rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="mw-absolute mw-top-full mw-left-0 mw-right-0 mw-mt-2 mw-z-50 mw-glass-card mw-rounded-xl mw-overflow-hidden mw-shadow-xl"
          >
            {/* Search input */}
            <div className="mw-flex mw-items-center mw-gap-2 mw-px-3 mw-py-2 mw-border-b mw-border-white/10">
              <Search className="mw-w-4 mw-h-4 mw-text-wallet-text-muted mw-flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search currencies…"
                className="mw-flex-1 mw-bg-transparent mw-text-sm mw-text-white mw-placeholder-wallet-text-muted mw-outline-none"
              />
            </div>

            {/* Options list */}
            <ul className="mw-max-h-56 mw-overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="mw-px-4 mw-py-3 mw-text-sm mw-text-wallet-text-muted">No results</li>
              ) : (
                filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => handleSelect(c)}
                      className="mw-w-full mw-flex mw-items-center mw-justify-between mw-px-4 mw-py-3 hover:mw-bg-wallet-surface-hover mw-transition-colors mw-text-left"
                    >
                      <div className="mw-min-w-0">
                        <p className="mw-text-sm mw-font-medium mw-text-white mw-truncate">{c.name}</p>
                        <p className="mw-text-xs mw-text-wallet-text-muted mw-tabular-nums">{formatBalance(c)}</p>
                      </div>
                      {selectedCurrency?.id === c.id && (
                        <Check className="mw-w-4 mw-h-4 mw-text-wallet-accent mw-flex-shrink-0 mw-ml-2" />
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CurrencyCardSkeleton() {
  return (
    <div className="mw-flex-shrink-0 mw-w-36 mw-h-16 mw-rounded-xl mw-glass-card mw-animate-pulse" />
  )
}

function CurrencyCard({ currency, isSelected, onClick }) {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency.decimalPlaces ?? 0,
  }).format(currency.balance)

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`mw-flex-shrink-0 mw-px-4 mw-py-3 mw-rounded-xl mw-transition-all ${isSelected ? 'mw-bg-wallet-accent/20 mw-border mw-border-wallet-accent/50' : 'mw-glass-card hover:mw-bg-wallet-surface-hover'}`}
    >
      <div className="mw-text-left">
        <p className="mw-text-sm mw-font-semibold mw-text-white">{currency.name}</p>
        <p className="mw-text-sm mw-text-wallet-text-muted mw-tabular-nums">{formattedBalance}</p>
      </div>
    </motion.button>
  )
}

function MainCard({ currency }) {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency.decimalPlaces ?? 0,
    maximumFractionDigits: currency.decimalPlaces ?? 0,
  }).format(currency.balance)


  return (
    <motion.div
      key={currency.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mw-relative mw-overflow-hidden mw-rounded-2xl mw-bg-gradient-to-br ${currency.color} mw-p-6 mw-shadow-xl`}
    >
      <div className="mw-absolute mw-inset-0 mw-opacity-10">
        <div className="mw-absolute mw-top-0 mw-right-0 mw-w-64 mw-h-64 mw-rounded-full mw-bg-white mw-blur-3xl mw-transform mw-translate-x-1/2 -mw-translate-y-1/2" />
        <div className="mw-absolute mw-bottom-0 mw-left-0 mw-w-48 mw-h-48 mw-rounded-full mw-bg-white mw-blur-3xl mw-transform -mw-translate-x-1/2 mw-translate-y-1/2" />
      </div>

      <div className="mw-relative mw-z-10">
        <p className="mw-text-white mw-text-2xl mw-font-bold mw-mb-1">{currency.name}</p>
        <p className="mw-text-white/60 mw-text-xs mw-font-medium mw-uppercase mw-tracking-wider mw-mb-4">Available Balance</p>
        <p className="mw-text-4xl sm:mw-text-5xl mw-font-bold mw-text-white mw-tabular-nums">{formattedBalance}</p>

        {/* Card holder / expires — commented out, may restore later
        <div className="mw-flex mw-items-center mw-justify-between">
          <div>
            <div className="mw-flex mw-gap-1 mw-mb-2">
              {[1, 2, 3, 4].map((group) => (
                <span key={group} className="mw-text-white/50 mw-text-sm mw-tracking-wider">
                  {group < 4 ? '\u2022\u2022\u2022\u2022' : '4829'}
                </span>
              ))}
            </div>
            <p className="mw-text-xs mw-text-white/50">CARD HOLDER</p>
            <p className="mw-text-white mw-font-medium">{walletName || 'USER'}</p>
          </div>
          <div className="mw-text-right">
            <p className="mw-text-xs mw-text-white/50">EXPIRES</p>
            <p className="mw-text-white mw-font-medium">12/28</p>
          </div>
        </div>
        */}
      </div>
    </motion.div>
  )
}

function MainCardSkeleton() {
  return (
    <div className="mw-h-48 mw-rounded-2xl mw-glass-card mw-animate-pulse" />
  )
}

export function WalletPage() {
  const { walletName, accountingEntityGuid, apiBaseUrl, authToken } = useWalletConfig()

  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState(null)
  const [showAccounting, setShowAccounting] = useState(false)

  useEffect(() => {
    if (!accountingEntityGuid || !apiBaseUrl) return

    setLoading(true)
    setError(null)

    getCurrencyBalances(accountingEntityGuid, apiBaseUrl, authToken)
      .then((raw) => {
        const normalized = normalizeCurrencies(raw)
        setCurrencies(normalized)
        setSelectedCurrency(normalized[0] ?? null)
      })
      .catch((err) => {
        console.error('[WalletPage] Failed to load currencies:', err.message, err)
        setError(err.message || 'Failed to load balances')
      })
      .finally(() => setLoading(false))
  }, [accountingEntityGuid, apiBaseUrl, authToken])

  const actions = [
    { icon: Plus, label: 'Add', color: 'mw-bg-green-500/20 mw-text-green-400' },
    { icon: ArrowLeftRight, label: 'Move', color: 'mw-bg-blue-500/20 mw-text-blue-400' },
    { icon: PieChart, label: 'Reports', color: 'mw-bg-purple-500/20 mw-text-purple-400', onClick: () => setShowAccounting(true) },
    { icon: MoreHorizontal, label: 'More', color: 'mw-bg-gray-500/20 mw-text-gray-400' },
  ]

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="mw-px-4 sm:mw-px-6 lg:mw-px-8 mw-py-6 mw-max-w-2xl mw-mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mw-mb-6">
        <p className="mw-text-wallet-text-muted">{greeting()},</p>
        <h1 className="mw-text-2xl mw-font-bold">{walletName?.split(' ')[0] || 'User'}</h1>
      </motion.div>

      {/* Currency selector dropdown */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <CurrencyDropdown
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelect={setSelectedCurrency}
          loading={loading}
          error={error}
        />
      </motion.div>

      {/* Currency cards — horizontal scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mw-flex mw-gap-3 mw-overflow-x-auto mw-pb-4 -mw-mx-4 mw-px-4 mw-scrollbar-hide mw-mb-6"
      >
        {loading && [0, 1, 2].map((i) => <CurrencyCardSkeleton key={i} />)}
        {!loading && currencies.map((currency) => (
          <CurrencyCard
            key={currency.id}
            currency={currency}
            isSelected={selectedCurrency?.id === currency.id}
            onClick={() => setSelectedCurrency(currency)}
          />
        ))}
      </motion.div>

      {/* Main balance card */}
      <AnimatePresence mode="wait">
        {selectedCurrency ? (
          <MainCard key={selectedCurrency.id} currency={selectedCurrency} />
        ) : (
          <MainCardSkeleton key="skeleton" />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mw-grid mw-grid-cols-4 mw-gap-3 mw-mt-6">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={action.onClick}
              className="mw-flex mw-flex-col mw-items-center mw-gap-2 mw-p-4 mw-glass-card hover:mw-bg-wallet-surface-hover mw-transition-colors"
            >
              <div className={`mw-p-3 mw-rounded-full ${action.color}`}>
                <Icon className="mw-w-5 mw-h-5" />
              </div>
              <span className="mw-text-sm mw-font-medium">{action.label}</span>
            </motion.button>
          )
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mw-grid mw-grid-cols-2 mw-gap-4 mw-mt-6">
        <button className="mw-flex mw-items-center mw-gap-3 mw-p-4 mw-glass-card hover:mw-bg-wallet-surface-hover mw-transition-colors">
          <div className="mw-p-2 mw-rounded-full mw-bg-wallet-accent/20">
            <Send className="mw-w-5 mw-h-5 mw-text-wallet-accent" />
          </div>
          <div className="mw-text-left">
            <p className="mw-font-medium">Send</p>
            <p className="mw-text-sm mw-text-wallet-text-muted">Transfer funds</p>
          </div>
        </button>

        <button className="mw-flex mw-items-center mw-gap-3 mw-p-4 mw-glass-card hover:mw-bg-wallet-surface-hover mw-transition-colors">
          <div className="mw-p-2 mw-rounded-full mw-bg-green-500/20">
            <Download className="mw-w-5 mw-h-5 mw-text-green-400" />
          </div>
          <div className="mw-text-left">
            <p className="mw-font-medium">Request</p>
            <p className="mw-text-sm mw-text-wallet-text-muted">Request payment</p>
          </div>
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mw-mt-8">
        <div className="mw-flex mw-items-center mw-justify-between mw-mb-4">
          <div className="mw-flex mw-items-center mw-gap-2">
            <History className="mw-w-5 mw-h-5 mw-text-wallet-text-muted" />
            <h3 className="mw-text-sm mw-font-semibold mw-text-wallet-text-muted mw-uppercase mw-tracking-wider">Recent Activity</h3>
          </div>
          <button className="mw-text-sm mw-text-wallet-accent hover:mw-text-wallet-accent-light mw-transition-colors">View all →</button>
        </div>
      </motion.div>

      <AccountingHub isOpen={showAccounting} onClose={() => setShowAccounting(false)} defaultCurrency={selectedCurrency?.code} />
    </div>
  )
}

export default WalletPage
