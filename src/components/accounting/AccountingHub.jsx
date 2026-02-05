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
        className="mw-fixed mw-inset-0 mw-z-[60] mw-bg-black/50"
      />

      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        exit={{ clipPath: 'inset(0 100% 0 0)' }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="mw-fixed mw-inset-0 mw-z-[100] mw-overflow-hidden"
      >
        <div
          className="mw-h-full mw-bg-wallet-bg mw-flex mw-flex-col"
          style={{ transform: `translateX(${dragOffset}px)`, transition: isDragging ? 'none' : 'transform 0.25s ease-out' }}
        >
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            className="mw-absolute mw-left-0 mw-top-0 mw-bottom-0 mw-w-10 mw-z-20 mw-cursor-grab active:mw-cursor-grabbing"
            style={{ touchAction: 'none', background: 'linear-gradient(to right, rgba(255, 255, 255, 0.05), transparent)' }}
          >
            <div
              onClick={(e) => { if (isDesktop && !isDragging) { e.stopPropagation(); onClose() } }}
              className={`mw-absolute mw-left-1/2 mw-flex mw-items-center mw-justify-center mw-p-2 mw-rounded-lg ${isDragging ? 'mw-bg-wallet-accent/90' : 'mw-bg-white/15 mw-backdrop-blur-md'} mw-border mw-border-white/20 mw-shadow-lg mw-transition-colors ${isDesktop ? 'mw-cursor-pointer hover:mw-bg-white/25' : ''}`}
              style={{ top: `${pillY}%`, transform: 'translate(-50%, -50%)', transition: isDragging ? 'none' : 'top 0.15s ease-out' }}
            >
              {isDesktop ? <X className="mw-w-5 mw-h-5 mw-text-white/70" /> : <ChevronRight className="mw-w-5 mw-h-5 mw-text-white/70" />}
            </div>
          </div>

          <div
            className="mw-flex mw-items-center mw-gap-4 mw-px-6 mw-pl-14 mw-py-4 mw-border-b mw-border-wallet-surface-border mw-bg-wallet-bg-secondary/50 mw-flex-shrink-0"
            style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
          >
            <div className="mw-flex-1 mw-min-w-0">
              <h2 className="mw-font-bold mw-text-xl">Financial Reports</h2>
              <p className="mw-text-sm mw-text-wallet-text-muted mw-flex mw-items-center mw-gap-1">
                <span>{currency.symbol}</span>
                <span>{defaultCurrency}</span>
                <span className="mw-text-wallet-text-muted/50">\u2022</span>
                <span>{currency.name}</span>
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={plLoading || bsLoading || txnLoading}
              className="mw-p-2 mw-rounded-full hover:mw-bg-wallet-bg-tertiary mw-transition-colors disabled:mw-opacity-50"
            >
              <RefreshCw className={`mw-w-5 mw-h-5 ${plLoading || bsLoading || txnLoading ? 'mw-animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mw-px-6 mw-pl-14 mw-py-2 mw-border-b mw-border-wallet-surface-border mw-flex-shrink-0">
            <DateRangePicker options={periodOptions} selected={selectedPeriod} onChange={changePeriod} />
          </div>

          <div className="mw-flex mw-border-b mw-border-wallet-surface-border mw-pl-10 mw-flex-shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`mw-flex-1 mw-flex mw-items-center mw-justify-center mw-gap-2 mw-py-3 mw-text-sm mw-font-medium mw-transition-colors mw-relative ${isActive ? 'mw-text-wallet-accent' : 'mw-text-wallet-text-muted hover:mw-text-wallet-text'}`}
                >
                  <Icon className="mw-w-4 mw-h-4" />
                  <span className="mw-hidden sm:mw-inline">{tab.label}</span>
                  <span className="sm:mw-hidden">{tab.id === 'pl' ? 'P&L' : tab.id === 'balance' ? 'Balance' : 'Txns'}</span>
                  {isActive && (
                    <motion.div layoutId="mw-accounting-tab-indicator" className="mw-absolute mw-bottom-0 mw-left-0 mw-right-0 mw-h-0.5 mw-bg-wallet-accent" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mw-flex-1 mw-overflow-y-auto mw-px-4 mw-pl-14 mw-py-4 mw-min-h-0">
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
