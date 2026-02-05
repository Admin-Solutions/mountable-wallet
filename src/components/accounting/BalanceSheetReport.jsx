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
    asset: { border: 'mw-border-l-green-400', icon: 'mw-text-green-400', total: 'mw-text-green-400' },
    liability: { border: 'mw-border-l-red-400', icon: 'mw-text-red-400', total: 'mw-text-red-400' },
    equity: { border: 'mw-border-l-wallet-accent', icon: 'mw-text-wallet-accent', total: 'mw-text-wallet-accent' },
  }

  const style = variantStyles[variant] || variantStyles.asset

  return (
    <div className={`mw-border-l-2 ${style.border} mw-pl-3`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mw-w-full mw-flex mw-items-center mw-justify-between mw-py-3 hover:mw-bg-wallet-surface-hover/30 mw-rounded-r-lg mw-transition-colors"
      >
        <div className="mw-flex mw-items-center mw-gap-3">
          <Icon className={`mw-w-5 mw-h-5 ${style.icon}`} />
          <span className="mw-font-semibold">{title}</span>
        </div>
        <div className="mw-flex mw-items-center mw-gap-3">
          <span className={`mw-font-semibold ${style.total}`}>
            {formatCurrency(total, currency)}
          </span>
          {isOpen ? (
            <ChevronDown className="mw-w-4 mw-h-4 mw-text-wallet-text-muted" />
          ) : (
            <ChevronRight className="mw-w-4 mw-h-4 mw-text-wallet-text-muted" />
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
            className="mw-overflow-hidden"
          >
            <div className="mw-space-y-2 mw-pb-3">
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
      <div className="mw-flex mw-items-center mw-justify-center mw-py-20">
        <Loader2 className="mw-w-8 mw-h-8 mw-text-wallet-accent mw-animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mw-text-center mw-py-20">
        <p className="mw-text-red-500 mw-mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="mw-px-4 mw-py-2 mw-bg-wallet-accent mw-rounded-lg hover:mw-bg-wallet-accent-light mw-transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mw-text-center mw-py-20 mw-text-wallet-text-muted">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mw-space-y-6"
    >
      <div className="mw-text-center">
        <p className="mw-text-wallet-text-muted mw-text-sm">
          As of {new Date(data.asOf).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mw-glass-card mw-p-4 mw-text-center"
      >
        <div className="mw-flex mw-items-center mw-justify-center mw-gap-2 mw-text-sm mw-text-wallet-text-muted mw-mb-2">
          <span>Assets</span>
          <span>=</span>
          <span>Liabilities</span>
          <span>+</span>
          <span>Equity</span>
        </div>
        <div className="mw-flex mw-items-center mw-justify-center mw-gap-2 mw-font-semibold">
          <span className="mw-text-green-400">{formatCurrency(data.assets.total, currency)}</span>
          <span className="mw-text-wallet-text-muted">=</span>
          <span className="mw-text-red-400">{formatCurrency(data.liabilities.total, currency)}</span>
          <span className="mw-text-wallet-text-muted">+</span>
          <span className="mw-text-wallet-accent">{formatCurrency(data.equity.total, currency)}</span>
        </div>
      </motion.div>

      <div className="mw-space-y-4">
        <h3 className="mw-text-lg mw-font-semibold mw-flex mw-items-center mw-gap-2">
          <Wallet className="mw-w-5 mw-h-5 mw-text-green-400" />
          Assets
          <span className="mw-text-wallet-text-muted mw-font-normal mw-text-sm mw-ml-auto">
            {formatCurrency(data.assets.total, currency)}
          </span>
        </h3>

        <div className="mw-space-y-4 mw-pl-2">
          {data.assets.current.items.length > 0 && (
            <BalanceSection title="Current Assets" icon={Wallet} items={data.assets.current.items} total={data.assets.current.total} currency={currency} variant="asset" onDrillDown={onDrillDown} />
          )}
          {data.assets.longTerm.items.length > 0 && (
            <BalanceSection title="Long-term Assets" icon={Wallet} items={data.assets.longTerm.items} total={data.assets.longTerm.total} currency={currency} variant="asset" onDrillDown={onDrillDown} />
          )}
        </div>
      </div>

      <div className="mw-space-y-4">
        <h3 className="mw-text-lg mw-font-semibold mw-flex mw-items-center mw-gap-2">
          <CreditCard className="mw-w-5 mw-h-5 mw-text-red-400" />
          Liabilities
          <span className="mw-text-wallet-text-muted mw-font-normal mw-text-sm mw-ml-auto">
            {formatCurrency(data.liabilities.total, currency)}
          </span>
        </h3>

        <div className="mw-space-y-4 mw-pl-2">
          {data.liabilities.current.items.length > 0 && (
            <BalanceSection title="Current Liabilities" icon={CreditCard} items={data.liabilities.current.items} total={data.liabilities.current.total} currency={currency} variant="liability" onDrillDown={onDrillDown} />
          )}
          {data.liabilities.longTerm.items.length > 0 && (
            <BalanceSection title="Long-term Liabilities" icon={CreditCard} items={data.liabilities.longTerm.items} total={data.liabilities.longTerm.total} currency={currency} variant="liability" onDrillDown={onDrillDown} />
          )}
          {data.liabilities.total === 0 && (
            <p className="mw-text-wallet-text-muted mw-text-sm mw-pl-4">No liabilities</p>
          )}
        </div>
      </div>

      <div className="mw-space-y-4">
        <h3 className="mw-text-lg mw-font-semibold mw-flex mw-items-center mw-gap-2">
          <PiggyBank className="mw-w-5 mw-h-5 mw-text-wallet-accent" />
          Equity
          <span className="mw-text-wallet-text-muted mw-font-normal mw-text-sm mw-ml-auto">
            {formatCurrency(data.equity.total, currency)}
          </span>
        </h3>

        <div className="mw-space-y-4 mw-pl-2">
          <BalanceSection title="Owner's Equity" icon={PiggyBank} items={data.equity.items} total={data.equity.total} currency={currency} variant="equity" onDrillDown={onDrillDown} />
        </div>
      </div>
    </motion.div>
  )
}

export default BalanceSheetReport
