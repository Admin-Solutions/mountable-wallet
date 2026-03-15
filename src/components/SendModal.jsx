import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, AlertTriangle, Loader2, CheckCircle,
  Search, User, ChevronDown,
} from 'lucide-react'
import { universalPost } from '../api/universalApi'
import { useWalletConfig } from '../context/WalletConfigContext'

const ENDPOINT_GET_BUDDIES  = '97535ab9-86f7-45de-8599-c9fdbf7038fd'
const ENDPOINT_GET_CURRENCIES = '6f8232c6-f3f4-432a-b9c9-e806307b2853'
const ENDPOINT_SEND_FUNDS   = 'b48f053b-7567-4c47-bf1b-a958e1582654'

const SP_ERRORS = {
  MustReauthorize:          'Your session has expired. Please log in again.',
  NotAuthorizedLedgerHolder:'You are not authorized to send from this wallet.',
  InsufficientFunds:        'Insufficient funds.',
  RaceCondition:            'Another transfer is in progress. Please try again.',
}

function normalizeBuddy(raw) {
  return {
    walletGuid: raw.walletGuid || raw.buddyWalletGUID || raw.BuddyWalletGUID || raw.profileRsmGUID || raw.ProfileRsmGUID || '',
    name:       raw.name || raw.profileTitle || raw.ProfileTitle || 'Unknown',
    avatar:     raw.avatar || raw.profileImageUrl || raw.ProfileImageUrl || null,
  }
}

export function SendModal({ isOpen, onClose }) {
  const { apiBaseUrl, onAuthError, onTransactionComplete } = useWalletConfig()

  // steps: 'recipient' → 'amount' → 'success'
  const [step, setStep]                 = useState('recipient')

  // Recipient step
  const [recipientSearch, setRecipientSearch] = useState('')
  const [buddies, setBuddies]           = useState([])
  const [loadingBuddies, setLoadingBuddies] = useState(false)
  const [selectedBuddy, setSelectedBuddy]   = useState(null)

  // Amount step
  const [currencies, setCurrencies]     = useState([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(false)
  const [currency, setCurrency]         = useState(null)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')
  const [amount, setAmount]             = useState('')

  // Confirm (inline, within amount step)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [confirmText, setConfirmText]   = useState('')
  const [sending, setSending]           = useState(false)
  const [sendError, setSendError]       = useState('')

  const searchTimerRef = useRef(null)

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const scrollY = window.scrollY
    document.body.style.overflow  = 'hidden'
    document.body.style.position  = 'fixed'
    document.body.style.top       = `-${scrollY}px`
    document.body.style.width     = '100%'
    return () => {
      document.body.style.overflow  = ''
      document.body.style.position  = ''
      document.body.style.top       = ''
      document.body.style.width     = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // Reset all state when modal opens
  useEffect(() => {
    if (!isOpen) return
    setStep('recipient')
    setRecipientSearch('')
    setBuddies([])
    setSelectedBuddy(null)
    setCurrencies([])
    setCurrency(null)
    setCurrencyOpen(false)
    setCurrencySearch('')
    setAmount('')
    setShowConfirm(false)
    setConfirmText('')
    setSending(false)
    setSendError('')
  }, [isOpen])

  // Debounced buddy search
  useEffect(() => {
    if (!isOpen || step !== 'recipient') return
    clearTimeout(searchTimerRef.current)

    if (!recipientSearch.trim()) {
      setBuddies([])
      return
    }

    searchTimerRef.current = setTimeout(async () => {
      setLoadingBuddies(true)
      try {
        const { value } = await universalPost(
          apiBaseUrl,
          ENDPOINT_GET_BUDDIES,
          {
            '@PageSize': '15',
            '@SearchText': recipientSearch.trim(),
          }
        )
        const raw = value?.[0]?.results?.[0]?.BuddyList
          || value?.[0]?.BuddyList
          || value
          || []
        setBuddies(
          Array.isArray(raw)
            ? raw.map(normalizeBuddy).filter(b => b.walletGuid)
            : []
        )
      } catch (e) {
        console.error('[SendModal] buddy search error:', e)
        setBuddies([])
      } finally {
        setLoadingBuddies(false)
      }
    }, 400)

    return () => clearTimeout(searchTimerRef.current)
  }, [recipientSearch, isOpen, step, apiBaseUrl])

  // Select buddy and fetch sendable currencies
  const handleSelectBuddy = async (buddy) => {
    setSelectedBuddy(buddy)
    setStep('amount')
    setLoadingCurrencies(true)
    try {
      const { value } = await universalPost(apiBaseUrl, ENDPOINT_GET_CURRENCIES, {})
      setCurrencies(value || [])
    } catch (e) {
      console.error('[SendModal] currency fetch error:', e)
      setCurrencies([])
    } finally {
      setLoadingCurrencies(false)
    }
  }

  const decimals     = currency?.practicalDecimalPlaces ?? 2
  const parsedAmount = parseFloat(amount) || 0
  const exceedsMax   = currency && parsedAmount > currency.maxSendableAmount
  const canSend      = currency && parsedAmount > 0 && !exceedsMax

  const handleAmountChange = (e) => {
    const val   = e.target.value.replace(/[^0-9.]/g, '')
    const parts = val.split('.')
    if (parts.length > 2) return
    if (parts[1]?.length > decimals) return
    setAmount(val)
  }

  const quickPicks = currency
    ? [0.25, 0.5, 0.75, 1]
        .map((f) => parseFloat((currency.maxSendableAmount * f).toFixed(decimals)))
        .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
    : []

  const filteredCurrencies = currencies.filter(c =>
    !currencySearch
    || c.currencyName?.toLowerCase().includes(currencySearch.toLowerCase())
    || c.symbol?.toLowerCase().includes(currencySearch.toLowerCase())
  )

  const handleConfirmSend = async () => {
    if (confirmText.trim().toUpperCase() !== 'YES') return
    if (!selectedBuddy?.walletGuid || !currency || !parsedAmount) return

    setSending(true)
    setSendError('')

    try {
      const { value } = await universalPost(
        apiBaseUrl,
        ENDPOINT_SEND_FUNDS,
        {
          '@TargetWalletGUID': selectedBuddy.walletGuid,
          '@CurrencyRAID':     currency.currencyRAID,
          '@Amount':           parsedAmount,
        }
      )

      const meta = value?.[0]?.meta || value?.[0] || {}

      if (meta.IsSuccessful === '0' || meta.IsSuccessful === 0) {
        if (meta.message === 'MustReauthorize') {
          onAuthError?.()
          onClose()
          return
        }
        setSendError(SP_ERRORS[meta.message] || meta.message || 'Transfer failed. Please try again.')
        return
      }

      onTransactionComplete?.()
      setStep('success')
      setTimeout(() => onClose(), 2000)
    } catch (e) {
      console.error('[SendModal] send error:', e)
      setSendError('Transfer failed. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className="relative rounded-2xl overflow-hidden mw-glass-card border border-white/10 shadow-2xl flex flex-col max-h-[85dvh]">

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-wallet-text-muted" />
              </button>

              {/* Header */}
              <div className="pt-8 pb-4 px-6 text-center flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-wallet-accent/10 border border-wallet-accent/20 mb-3">
                  {step === 'success'
                    ? <CheckCircle className="w-5 h-5 text-green-400" />
                    : <Send className="w-5 h-5 text-wallet-accent" />
                  }
                </div>
                <h2 className="text-lg font-bold tracking-tight">
                  {step === 'success' ? 'Sent!' : 'Send Funds'}
                </h2>
                {selectedBuddy && step !== 'success' && (
                  <p className="text-xs text-wallet-text-muted mt-1">to {selectedBuddy.name}</p>
                )}
              </div>

              <div className="mx-6 h-px bg-white/8 flex-shrink-0" />

              <AnimatePresence mode="wait">

                {/* ── STEP: recipient ── */}
                {step === 'recipient' && (
                  <motion.div
                    key="recipient"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col flex-1 overflow-hidden"
                  >
                    <div className="px-6 py-5 flex flex-col gap-3 flex-1 overflow-hidden">
                      <label className="text-sm font-medium text-wallet-text-muted">Search buddies</label>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wallet-text-muted pointer-events-none" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search by name…"
                          value={recipientSearch}
                          onChange={(e) => setRecipientSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wallet-text-muted focus:outline-none focus:border-wallet-accent/50 transition-colors"
                        />
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        {loadingBuddies && (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-5 h-5 text-wallet-text-muted animate-spin" />
                          </div>
                        )}

                        {!loadingBuddies && !recipientSearch && (
                          <p className="text-center text-sm text-wallet-text-muted py-10">
                            Type to search your buddies
                          </p>
                        )}

                        {!loadingBuddies && recipientSearch && buddies.length === 0 && (
                          <p className="text-center text-sm text-wallet-text-muted py-10">
                            No buddies found
                          </p>
                        )}

                        {buddies.map((buddy) => (
                          <button
                            key={buddy.walletGuid}
                            onClick={() => handleSelectBuddy(buddy)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-wallet-surface-hover transition-colors text-left"
                          >
                            {buddy.avatar ? (
                              <img src={buddy.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-wallet-accent/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-wallet-accent" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-white truncate">{buddy.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP: amount ── */}
                {step === 'amount' && (
                  <motion.div
                    key="amount"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col flex-1 overflow-y-auto min-h-0"
                  >
                    <div className="px-6 py-5 space-y-5">

                      {/* Currency selector */}
                      <div>
                        <label className="block text-sm font-medium text-wallet-text-muted mb-2">Currency</label>
                        <button
                          onClick={() => { setCurrencyOpen(!currencyOpen); setCurrencySearch('') }}
                          disabled={loadingCurrencies}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors disabled:opacity-60"
                        >
                          {loadingCurrencies ? (
                            <span className="flex items-center gap-2 text-wallet-text-muted">
                              <Loader2 className="w-4 h-4 animate-spin" />Loading…
                            </span>
                          ) : currency ? (
                            <span className="text-white font-medium">{currency.currencyName} ({currency.symbol})</span>
                          ) : (
                            <span className="text-wallet-text-muted">Select currency</span>
                          )}
                          <ChevronDown className={`w-4 h-4 text-wallet-text-muted transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {currencyOpen && filteredCurrencies.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                <div className="relative border-b border-white/10">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wallet-text-muted pointer-events-none" />
                                  <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search currencies…"
                                    value={currencySearch}
                                    onChange={(e) => setCurrencySearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-transparent text-sm text-white placeholder:text-wallet-text-muted focus:outline-none"
                                  />
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                  {filteredCurrencies.map((c) => (
                                    <button
                                      key={c.currencyGuid}
                                      onClick={() => { setCurrency(c); setCurrencyOpen(false); setCurrencySearch(''); setAmount('') }}
                                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                                        currency?.currencyGuid === c.currencyGuid
                                          ? 'bg-wallet-accent/20 text-wallet-accent'
                                          : 'hover:bg-wallet-surface-hover text-white'
                                      }`}
                                    >
                                      <span className="font-medium">{c.currencyName}</span>
                                      <span className="text-sm text-wallet-text-muted">
                                        {c.maxSendableAmount?.toFixed(c.practicalDecimalPlaces ?? 2)}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Available balance */}
                      {currency && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5"
                        >
                          <span className="text-sm text-wallet-text-muted">Available to send</span>
                          <span className="text-sm font-medium">
                            {currency.maxSendableAmount.toFixed(decimals)} {currency.symbol}
                          </span>
                        </motion.div>
                      )}

                      {/* Amount input */}
                      {currency && (
                        <div>
                          <label className="block text-sm font-medium text-wallet-text-muted mb-2">Amount</label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder={`0.${'0'.repeat(decimals)}`}
                              value={amount}
                              onChange={handleAmountChange}
                              className={`w-full pl-4 pr-16 py-3 rounded-xl bg-white/5 border text-white text-lg placeholder:text-wallet-text-muted focus:outline-none transition-colors ${
                                exceedsMax
                                  ? 'border-red-500/60 focus:border-red-500'
                                  : 'border-white/10 focus:border-wallet-accent/50'
                              }`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-wallet-text-muted text-sm font-medium">
                              {currency.symbol}
                            </span>
                          </div>
                          {exceedsMax && (
                            <p className="text-red-400 text-xs mt-1">
                              Exceeds available balance of {currency.maxSendableAmount.toFixed(decimals)} {currency.symbol}
                            </p>
                          )}

                          {/* Quick picks */}
                          {quickPicks.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex gap-2 mt-3"
                            >
                              {quickPicks.map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setAmount(String(preset))}
                                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    amount === String(preset)
                                      ? 'bg-wallet-accent/20 text-wallet-accent border border-wallet-accent/40'
                                      : 'bg-white/5 text-wallet-text-muted hover:bg-white/10 border border-transparent'
                                  }`}
                                >
                                  {preset.toFixed(decimals)}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mx-6 h-px bg-white/8 flex-shrink-0" />

                    <div className="px-6 py-5 space-y-3 flex-shrink-0">
                      <AnimatePresence mode="wait">
                        {!showConfirm ? (
                          <motion.button
                            key="send-btn"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={() => { setShowConfirm(true); setConfirmText(''); setSendError('') }}
                            disabled={!canSend}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-colors ${
                              canSend
                                ? 'bg-wallet-accent hover:opacity-90 text-white'
                                : 'bg-white/5 text-wallet-text-muted cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-5 h-5" />
                            Send{currency && parsedAmount > 0 ? ` ${parsedAmount.toFixed(decimals)} ${currency.symbol}` : ''}
                          </motion.button>
                        ) : (
                          <motion.div
                            key="confirm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="relative space-y-3"
                          >
                            {sending && (
                              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/60 backdrop-blur-sm">
                                <Loader2 className="w-8 h-8 text-wallet-accent animate-spin" />
                                <p className="text-sm font-medium text-wallet-text-muted">Sending funds…</p>
                              </div>
                            )}

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-red-400">Are you sure?</p>
                                <p className="text-xs text-wallet-text-muted mt-1">
                                  You are about to send{' '}
                                  <span className="text-white font-medium">{parsedAmount.toFixed(decimals)} {currency?.symbol}</span>
                                  {' '}to{' '}
                                  <span className="text-white font-medium">{selectedBuddy?.name}</span>.
                                  This action cannot be reversed.
                                </p>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-wallet-text-muted mb-1.5">
                                Type <span className="text-red-400 font-bold">YES</span> to confirm
                              </label>
                              <input
                                type="text"
                                autoFocus
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSend() }}
                                placeholder="YES"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-red-500/30 text-white text-center text-lg font-bold tracking-widest placeholder:text-wallet-text-muted/30 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-red-500/60 transition-colors"
                              />
                            </div>

                            {sendError && (
                              <p className="text-red-400 text-sm text-center">{sendError}</p>
                            )}

                            <div className="flex gap-3">
                              <button
                                onClick={() => { setShowConfirm(false); setConfirmText(''); setSendError('') }}
                                disabled={sending}
                                className="flex-1 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-wallet-text-muted transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleConfirmSend}
                                disabled={confirmText.trim().toUpperCase() !== 'YES' || sending}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${
                                  confirmText.trim().toUpperCase() === 'YES' && !sending
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-white/5 text-wallet-text-muted cursor-not-allowed'
                                }`}
                              >
                                {sending
                                  ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                                  : <><Send className="w-4 h-4" />Confirm Send</>
                                }
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!showConfirm && (
                        <button
                          onClick={() => { setStep('recipient'); setSelectedBuddy(null) }}
                          className="w-full py-2.5 text-sm text-wallet-text-muted hover:text-white transition-colors"
                        >
                          ← Change recipient
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP: success ── */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-10 text-center"
                  >
                    <p className="text-green-400 font-medium">
                      {parsedAmount.toFixed(decimals)} {currency?.symbol} sent to {selectedBuddy?.name}
                    </p>
                    <p className="text-wallet-text-muted text-sm mt-1">Transfer complete</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SendModal
