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
import { SendModal } from './SendModal'
import { AddFundsModal } from './AddFundsModal'
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
    <div ref={containerRef} className="relative mb-6">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading || !!error}
        className="w-full flex items-center justify-between px-4 py-3 mw-glass-card hover:bg-wallet-surface-hover transition-colors rounded-xl disabled:opacity-50"
      >
        <div className="text-left min-w-0">
          {loading ? (
            <span className="text-wallet-text-muted text-sm">Loading currencies…</span>
          ) : error ? (
            <span className="text-red-400 text-sm">{error}</span>
          ) : selectedCurrency ? (
            <>
              <p className="text-sm font-semibold text-white truncate">{selectedCurrency.name}</p>
              <p className="text-xs text-wallet-text-muted tabular-nums">{formatBalance(selectedCurrency)}</p>
            </>
          ) : (
            <span className="text-wallet-text-muted text-sm">Select currency</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-wallet-text-muted flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
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
            className="absolute top-full left-0 right-0 mt-2 z-50 mw-glass-card rounded-xl overflow-hidden shadow-xl"
          >
            {/* Search input */}
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

            {/* Options list */}
            <ul className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-wallet-text-muted">No results</li>
              ) : (
                filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => handleSelect(c)}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CurrencyCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-36 h-16 rounded-xl mw-glass-card animate-pulse" />
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
      className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all ${isSelected ? 'bg-wallet-accent/20 border border-wallet-accent/50' : 'mw-glass-card hover:bg-wallet-surface-hover'}`}
    >
      <div className="text-left">
        <p className="text-sm font-semibold text-white">{currency.name}</p>
        <p className="text-sm text-wallet-text-muted tabular-nums">{formattedBalance}</p>
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
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currency.color} p-6 shadow-xl`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        <p className="text-white text-2xl font-bold mb-1">{currency.name}</p>
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">Available Balance</p>
        <p className="text-4xl sm:text-5xl font-bold text-white tabular-nums">{formattedBalance}</p>

        {/* Card holder / expires — commented out, may restore later
        <div className="flex items-center justify-between">
          <div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4].map((group) => (
                <span key={group} className="text-white/50 text-sm tracking-wider">
                  {group < 4 ? '\u2022\u2022\u2022\u2022' : '4829'}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/50">CARD HOLDER</p>
            <p className="text-white font-medium">{walletName || 'USER'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">EXPIRES</p>
            <p className="text-white font-medium">12/28</p>
          </div>
        </div>
        */}
      </div>
    </motion.div>
  )
}

function MainCardSkeleton() {
  return (
    <div className="h-48 rounded-2xl mw-glass-card animate-pulse" />
  )
}

export function WalletPage() {
  const { walletName, accountingEntityGuid, apiBaseUrl, authToken } = useWalletConfig()

  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState(null)
  const [showAccounting, setShowAccounting] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [showAddFunds, setShowAddFunds] = useState(false)

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
    { icon: Plus, label: 'Add', color: 'bg-green-500/20 text-green-400', onClick: () => setShowAddFunds(true) },
    { icon: ArrowLeftRight, label: 'Move', color: 'bg-blue-500/20 text-blue-400' },
    { icon: PieChart, label: 'Reports', color: 'bg-purple-500/20 text-purple-400', onClick: () => setShowAccounting(true) },
    { icon: MoreHorizontal, label: 'More', color: 'bg-gray-500/20 text-gray-400' },
  ]

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <p className="text-wallet-text-muted">{greeting()},</p>
            <h1 className="text-2xl font-bold">{walletName?.split(' ')[0] || 'User'}</h1>
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
            className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 mw-scrollbar-hide mb-6"
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-4 gap-3 mt-6">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-2 p-4 mw-glass-card hover:bg-wallet-surface-hover transition-colors"
                >
                  <div className={`p-3 rounded-full ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              )
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => setShowSend(true)}
              className="flex items-center gap-3 p-4 mw-glass-card hover:bg-wallet-surface-hover transition-colors"
            >
              <div className="p-2 rounded-full bg-wallet-accent/20">
                <Send className="w-5 h-5 text-wallet-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium">Send</p>
                <p className="text-sm text-wallet-text-muted">Transfer funds</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 mw-glass-card hover:bg-wallet-surface-hover transition-colors">
              <div className="p-2 rounded-full bg-green-500/20">
                <Download className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">Request</p>
                <p className="text-sm text-wallet-text-muted">Request payment</p>
              </div>
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-wallet-text-muted" />
                <h3 className="text-sm font-semibold text-wallet-text-muted uppercase tracking-wider">Recent Activity</h3>
              </div>
              <button className="text-sm text-wallet-accent hover:text-wallet-accent-light transition-colors">View all →</button>
            </div>
          </motion.div>

          <AccountingHub isOpen={showAccounting} onClose={() => setShowAccounting(false)} defaultCurrency={selectedCurrency?.code} />
        </div>
      </div>

      <SendModal isOpen={showSend} onClose={() => setShowSend(false)} />
      <AddFundsModal isOpen={showAddFunds} onClose={() => setShowAddFunds(false)} currency={selectedCurrency} />
    </div>
  )
}

export default WalletPage
