import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, FileText, Scale, List, RefreshCw, X } from 'lucide-react'
import { useAccounting } from '../../hooks/useAccounting'
import { DateRangePicker } from './DateRangePicker'
import { ProfitLossReport } from './ProfitLossReport'
import { BalanceSheetReport } from './BalanceSheetReport'
import { TransactionList } from './TransactionList'

const TABS = [
  { id: 'pl', label: 'P&L', icon: FileText },
  { id: 'balance', label: 'Balance Sheet', icon: Scale },
  { id: 'transactions', label: 'Transactions', icon: List },
]

const currencyInfo = {
  GBP: { symbol: '\u00A3', name: 'British Pound' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '\u20AC', name: 'Euro' },
  BHC: { symbol: '\uD83C\uDFF4\u200D\u2620\uFE0F', name: 'Black Hole Coins' },
}

export function AccountingHub({ isOpen, onClose, defaultCurrency = 'GBP' }) {
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [pillY, setPillY] = useState(50)
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 768)
  const dragStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const {
    selectedPeriod, changePeriod, periodOptions, activeTab, changeTab,
    profitLoss, plLoading, plError, balanceSheet, bsLoading, bsError,
    transactions, txnLoading, txnError, txnPagination, txnFilter, setTxnFilter,
    loadMoreTransactions, drillDownCategory, drillDown, clearDrillDown, refresh,
  } = useAccounting({ currencyCode: defaultCurrency })

  const currency = currencyInfo[defaultCurrency] || currencyInfo.GBP

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      setDragOffset(0)
      setPillY(50)
      setIsDragging(false)
      return () => {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  const handleTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    dragStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches || !e.touches[0]) return
    e.preventDefault()
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.current.x
    setDragOffset(Math.max(0, deltaX))
    setPillY(Math.max(10, Math.min(90, (touch.clientY / window.innerHeight) * 100)))
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragOffset > window.innerWidth * 0.3) {
      setDragOffset(window.innerWidth)
      setTimeout(() => onClose(), 250)
    } else {
      setDragOffset(0)
    }
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
  }

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStart.current.x
      setDragOffset(Math.max(0, deltaX))
      setPillY(Math.max(10, Math.min(90, (e.clientY / window.innerHeight) * 100)))
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      if (dragOffset > window.innerWidth * 0.3) {
        setDragOffset(window.innerWidth)
        setTimeout(() => onClose(), 250)
      } else {
        setDragOffset(0)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, onClose])

  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/50"
      />

      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        exit={{ clipPath: 'inset(0 100% 0 0)' }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        <div
          className="h-full bg-wallet-bg flex flex-col"
          style={{ transform: `translateX(${dragOffset}px)`, transition: isDragging ? 'none' : 'transform 0.25s ease-out' }}
        >
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            className="absolute left-0 top-0 bottom-0 w-10 z-20 cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none', background: 'linear-gradient(to right, rgba(255, 255, 255, 0.05), transparent)' }}
          >
            <div
              onClick={(e) => { if (isDesktop && !isDragging) { e.stopPropagation(); onClose() } }}
              className={`absolute left-1/2 flex items-center justify-center p-2 rounded-lg ${isDragging ? 'bg-wallet-accent/90' : 'bg-white/15 backdrop-blur-md'} border border-white/20 shadow-lg transition-colors ${isDesktop ? 'cursor-pointer hover:bg-white/25' : ''}`}
              style={{ top: `${pillY}%`, transform: 'translate(-50%, -50%)', transition: isDragging ? 'none' : 'top 0.15s ease-out' }}
            >
              {isDesktop ? <X className="w-5 h-5 text-white/70" /> : <ChevronRight className="w-5 h-5 text-white/70" />}
            </div>
          </div>

          <div
            className="flex items-center gap-4 px-6 pl-14 py-4 border-b border-wallet-surface-border bg-wallet-bg-secondary/50 flex-shrink-0"
            style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
          >
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl">Financial Reports</h2>
              <p className="text-sm text-wallet-text-muted flex items-center gap-1">
                <span>{currency.symbol}</span>
                <span>{defaultCurrency}</span>
                <span className="text-wallet-text-muted/50">\u2022</span>
                <span>{currency.name}</span>
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={plLoading || bsLoading || txnLoading}
              className="p-2 rounded-full hover:bg-wallet-bg-tertiary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${plLoading || bsLoading || txnLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="px-6 pl-14 py-2 border-b border-wallet-surface-border flex-shrink-0">
            <DateRangePicker options={periodOptions} selected={selectedPeriod} onChange={changePeriod} />
          </div>

          <div className="flex border-b border-wallet-surface-border pl-10 flex-shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${isActive ? 'text-wallet-accent' : 'text-wallet-text-muted hover:text-wallet-text'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'pl' ? 'P&L' : tab.id === 'balance' ? 'Balance' : 'Txns'}</span>
                  {isActive && (
                    <motion.div layoutId="mw-accounting-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-wallet-accent" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pl-14 py-4 min-h-0">
            <AnimatePresence mode="wait">
              {activeTab === 'pl' && (
                <motion.div key="pl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <ProfitLossReport data={profitLoss} loading={plLoading} error={plError} currency={defaultCurrency} onDrillDown={drillDown} onRefresh={refresh} />
                </motion.div>
              )}
              {activeTab === 'balance' && (
                <motion.div key="balance" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <BalanceSheetReport data={balanceSheet} loading={bsLoading} error={bsError} currency={defaultCurrency} onDrillDown={drillDown} onRefresh={refresh} />
                </motion.div>
              )}
              {activeTab === 'transactions' && (
                <motion.div key="transactions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <TransactionList transactions={transactions} loading={txnLoading} error={txnError} currency={defaultCurrency} pagination={txnPagination} filter={txnFilter} onFilterChange={setTxnFilter} onLoadMore={loadMoreTransactions} onRefresh={refresh} drillDownCategory={drillDownCategory} onClearDrillDown={clearDrillDown} />
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ height: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }} />
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default AccountingHub
