import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ChevronDown, ChevronRight, Wallet, CreditCard, PiggyBank } from 'lucide-react'
import { LineItemRow } from './LineItemRow'
import { formatCurrency } from '../../services/accountingService'

function BalanceSection({
  title,
  icon: Icon,
  items = [],
  total,
  currency,
  variant,
  onDrillDown,
  defaultOpen = true,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const variantStyles = {
    asset: { border: 'border-l-green-400', icon: 'text-green-400', total: 'text-green-400' },
    liability: { border: 'border-l-red-400', icon: 'text-red-400', total: 'text-red-400' },
    equity: { border: 'border-l-wallet-accent', icon: 'text-wallet-accent', total: 'text-wallet-accent' },
  }

  const style = variantStyles[variant] || variantStyles.asset

  return (
    <div className={`border-l-2 ${style.border} pl-3`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 hover:bg-wallet-surface-hover/30 rounded-r-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${style.icon}`} />
          <span className="font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-semibold ${style.total}`}>
            {formatCurrency(total, currency)}
          </span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-wallet-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-wallet-text-muted" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && items.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pb-3">
              {items.map((item, index) => (
                <LineItemRow
                  key={item.id}
                  name={item.name}
                  amount={item.amount}
                  currency={currency}
                  index={index}
                  onClick={() => onDrillDown?.(item.categoryId, item.name)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function BalanceSheetReport({
  data,
  loading,
  error,
  currency = 'GBP',
  onDrillDown,
  onRefresh,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-wallet-accent animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-wallet-accent rounded-lg hover:bg-wallet-accent-light transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-wallet-text-muted">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <p className="text-wallet-text-muted text-sm">
          As of {new Date(data.asOf).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mw-glass-card p-4 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-wallet-text-muted mb-2">
          <span>Assets</span>
          <span>=</span>
          <span>Liabilities</span>
          <span>+</span>
          <span>Equity</span>
        </div>
        <div className="flex items-center justify-center gap-2 font-semibold">
          <span className="text-green-400">{formatCurrency(data.assets.total, currency)}</span>
          <span className="text-wallet-text-muted">=</span>
          <span className="text-red-400">{formatCurrency(data.liabilities.total, currency)}</span>
          <span className="text-wallet-text-muted">+</span>
          <span className="text-wallet-accent">{formatCurrency(data.equity.total, currency)}</span>
        </div>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-400" />
          Assets
          <span className="text-wallet-text-muted font-normal text-sm ml-auto">
            {formatCurrency(data.assets.total, currency)}
          </span>
        </h3>

        <div className="space-y-4 pl-2">
          {data.assets.current.items.length > 0 && (
            <BalanceSection title="Current Assets" icon={Wallet} items={data.assets.current.items} total={data.assets.current.total} currency={currency} variant="asset" onDrillDown={onDrillDown} />
          )}
          {data.assets.longTerm.items.length > 0 && (
            <BalanceSection title="Long-term Assets" icon={Wallet} items={data.assets.longTerm.items} total={data.assets.longTerm.total} currency={currency} variant="asset" onDrillDown={onDrillDown} />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-red-400" />
          Liabilities
          <span className="text-wallet-text-muted font-normal text-sm ml-auto">
            {formatCurrency(data.liabilities.total, currency)}
          </span>
        </h3>

        <div className="space-y-4 pl-2">
          {data.liabilities.current.items.length > 0 && (
            <BalanceSection title="Current Liabilities" icon={CreditCard} items={data.liabilities.current.items} total={data.liabilities.current.total} currency={currency} variant="liability" onDrillDown={onDrillDown} />
          )}
          {data.liabilities.longTerm.items.length > 0 && (
            <BalanceSection title="Long-term Liabilities" icon={CreditCard} items={data.liabilities.longTerm.items} total={data.liabilities.longTerm.total} currency={currency} variant="liability" onDrillDown={onDrillDown} />
          )}
          {data.liabilities.total === 0 && (
            <p className="text-wallet-text-muted text-sm pl-4">No liabilities</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-wallet-accent" />
          Equity
          <span className="text-wallet-text-muted font-normal text-sm ml-auto">
            {formatCurrency(data.equity.total, currency)}
          </span>
        </h3>

        <div className="space-y-4 pl-2">
          <BalanceSection title="Owner's Equity" icon={PiggyBank} items={data.equity.items} total={data.equity.total} currency={currency} variant="equity" onDrillDown={onDrillDown} />
        </div>
      </div>
    </motion.div>
  )
}

export default BalanceSheetReport
