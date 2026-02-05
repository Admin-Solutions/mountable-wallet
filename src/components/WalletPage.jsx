import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ArrowLeftRight,
  PieChart,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Send,
  Download,
  History
} from 'lucide-react'
import { AccountingHub } from './accounting'
import { useWalletConfig } from '../context/WalletConfigContext'

// Mock currency data
const mockCurrencies = [
  { id: 'gbp', symbol: '\u00A3', code: 'GBP', name: 'British Pound', balance: 124850, change: 2.4, color: 'mw-from-blue-600 mw-to-blue-800' },
  { id: 'usd', symbol: '$', code: 'USD', name: 'US Dollar', balance: 45230, change: -0.8, color: 'mw-from-green-600 mw-to-green-800' },
  { id: 'eur', symbol: '\u20AC', code: 'EUR', name: 'Euro', balance: 18420, change: 1.2, color: 'mw-from-indigo-600 mw-to-indigo-800' },
  { id: 'bh', symbol: '\uD83C\uDFF4\u200D\u2620\uFE0F', code: 'BHC', name: 'Black Hole Coins', balance: 5200, change: 15.3, color: 'mw-from-purple-600 mw-to-purple-800' },
]

// Mock transaction history
const mockTransactions = [
  { id: '1', type: 'received', amount: 500, currency: 'USD', from: 'Black Hole Nation', date: 'Today' },
  { id: '2', type: 'sent', amount: 150, currency: 'GBP', to: 'CTF Registration', date: 'Yesterday' },
  { id: '3', type: 'received', amount: 1000, currency: 'BHC', from: 'Game Rewards', date: 'Jan 28' },
]

function CurrencyCard({ currency, isSelected, onClick }) {
  const formattedBalance = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(currency.balance)

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`mw-flex-shrink-0 mw-px-4 mw-py-3 mw-rounded-xl mw-transition-all ${isSelected ? 'mw-bg-wallet-accent/20 mw-border mw-border-wallet-accent/50' : 'mw-glass-card hover:mw-bg-wallet-surface-hover'}`}
    >
      <div className="mw-flex mw-items-center mw-gap-3">
        <div className={`mw-w-10 mw-h-10 mw-rounded-full mw-bg-gradient-to-br ${currency.color} mw-flex mw-items-center mw-justify-center mw-text-white mw-font-bold`}>
          {currency.symbol}
        </div>
        <div className="mw-text-left">
          <p className="mw-text-xs mw-text-wallet-text-muted">{currency.code}</p>
          <p className="mw-font-semibold">{currency.symbol}{formattedBalance}</p>
        </div>
      </div>
    </motion.button>
  )
}

function MainCard({ currency }) {
  const formattedBalance = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(currency.balance)
  const { walletName } = useWalletConfig()

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
        <div className="mw-flex mw-items-center mw-justify-between mw-mb-6">
          <p className="mw-text-white/70 mw-text-sm mw-font-medium">AVAILABLE BALANCE</p>
          <span className="mw-px-3 mw-py-1 mw-rounded-full mw-bg-white/20 mw-text-white mw-text-sm mw-font-medium">{currency.code}</span>
        </div>

        <p className="mw-text-4xl sm:mw-text-5xl mw-font-bold mw-text-white mw-mb-8">{currency.symbol}{formattedBalance}</p>

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
      </div>

      <div className={`mw-absolute mw-top-6 mw-right-6 mw-flex mw-items-center mw-gap-1 mw-px-2 mw-py-1 mw-rounded-full ${currency.change >= 0 ? 'mw-bg-green-500/20 mw-text-green-300' : 'mw-bg-red-500/20 mw-text-red-300'}`}>
        {currency.change >= 0 ? <TrendingUp className="mw-w-3 mw-h-3" /> : <TrendingDown className="mw-w-3 mw-h-3" />}
        <span className="mw-text-xs mw-font-medium">{Math.abs(currency.change)}%</span>
      </div>
    </motion.div>
  )
}

export function WalletPage() {
  const [selectedCurrency, setSelectedCurrency] = useState(mockCurrencies[0])
  const [showAccounting, setShowAccounting] = useState(false)
  const { walletName } = useWalletConfig()

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mw-flex mw-gap-3 mw-overflow-x-auto mw-pb-4 -mw-mx-4 mw-px-4 mw-scrollbar-hide mw-mb-6"
      >
        {mockCurrencies.map((currency) => (
          <CurrencyCard key={currency.id} currency={currency} isSelected={selectedCurrency.id === currency.id} onClick={() => setSelectedCurrency(currency)} />
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <MainCard key={selectedCurrency.id} currency={selectedCurrency} />
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
          <button className="mw-text-sm mw-text-wallet-accent hover:mw-text-wallet-accent-light mw-transition-colors">View all \u2192</button>
        </div>

        <div className="mw-space-y-3">
          {mockTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="mw-flex mw-items-center mw-justify-between mw-p-4 mw-glass-card"
            >
              <div className="mw-flex mw-items-center mw-gap-3">
                <div className={`mw-p-2 mw-rounded-full ${tx.type === 'received' ? 'mw-bg-green-500/20 mw-text-green-400' : 'mw-bg-red-500/20 mw-text-red-400'}`}>
                  {tx.type === 'received' ? <Download className="mw-w-4 mw-h-4" /> : <Send className="mw-w-4 mw-h-4" />}
                </div>
                <div>
                  <p className="mw-font-medium">{tx.type === 'received' ? tx.from : tx.to}</p>
                  <p className="mw-text-sm mw-text-wallet-text-muted">{tx.date}</p>
                </div>
              </div>
              <p className={`mw-font-semibold ${tx.type === 'received' ? 'mw-text-green-400' : 'mw-text-red-400'}`}>
                {tx.type === 'received' ? '+' : '-'}{tx.amount} {tx.currency}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AccountingHub isOpen={showAccounting} onClose={() => setShowAccounting(false)} defaultCurrency={selectedCurrency.code} />
    </div>
  )
}

export default WalletPage
