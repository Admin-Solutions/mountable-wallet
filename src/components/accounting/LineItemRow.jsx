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
    default: { amount: 'text-wallet-text' },
    revenue: { amount: 'text-green-400' },
    expense: { amount: 'text-red-400' },
  }

  const style = variants[variant] || variants.default

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full mw-glass-card p-4 flex items-center gap-3 hover:bg-wallet-surface-hover active:scale-[0.99] transition-all text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        {(subtitle || transactions) && (
          <p className="text-wallet-text-muted text-sm">
            {subtitle || `${transactions} transactions`}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${style.amount}`}>
          {formatCurrency(amount, currency)}
        </span>
        <ChevronRight className="w-4 h-4 text-wallet-text-muted" />
      </div>
    </motion.button>
  )
}

export default LineItemRow
