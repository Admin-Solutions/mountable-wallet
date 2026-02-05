import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { formatCurrency } from '../../services/accountingService'

export function LineItemRow({
  name,
  amount,
  currency = 'GBP',
  subtitle,
  transactions,
  onClick,
  variant = 'default',
  index = 0,
}) {
  const variants = {
    default: { amount: 'mw-text-wallet-text' },
    revenue: { amount: 'mw-text-green-400' },
    expense: { amount: 'mw-text-red-400' },
  }

  const style = variants[variant] || variants.default

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="mw-w-full mw-glass-card mw-p-4 mw-flex mw-items-center mw-gap-3 hover:mw-bg-wallet-surface-hover active:mw-scale-[0.99] mw-transition-all mw-text-left"
    >
      <div className="mw-flex-1 mw-min-w-0">
        <p className="mw-font-medium mw-truncate">{name}</p>
        {(subtitle || transactions) && (
          <p className="mw-text-wallet-text-muted mw-text-sm">
            {subtitle || `${transactions} transactions`}
          </p>
        )}
      </div>
      <div className="mw-flex mw-items-center mw-gap-2">
        <span className={`mw-font-semibold ${style.amount}`}>
          {formatCurrency(amount, currency)}
        </span>
        <ChevronRight className="mw-w-4 mw-h-4 mw-text-wallet-text-muted" />
      </div>
    </motion.button>
  )
}

export default LineItemRow
