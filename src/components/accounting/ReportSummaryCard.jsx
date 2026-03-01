import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatChange } from '../../services/accountingService'

export function ReportSummaryCard({
  label,
  value,
  currency = 'GBP',
  change,
  variant = 'default',
  onClick,
  index = 0,
}) {
  const variants = {
    default: { bg: 'bg-wallet-bg-tertiary/50', text: 'text-wallet-text', accent: 'text-wallet-accent' },
    revenue: { bg: 'bg-green-500/10', text: 'text-green-400', accent: 'text-green-400' },
    expense: { bg: 'bg-red-500/10', text: 'text-red-400', accent: 'text-red-400' },
    net: { bg: 'bg-wallet-accent/10', text: 'text-wallet-accent', accent: 'text-wallet-accent' },
  }

  const style = variants[variant] || variants.default
  const isPositiveChange = change >= 0
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={`
        mw-glass-card p-4 text-center flex-1 min-w-0
        ${onClick ? 'cursor-pointer hover:bg-wallet-surface-hover active:scale-[0.98] transition-all' : ''}
        ${style.bg}
      `}
    >
      <p className="text-wallet-text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-bold truncate ${style.text}`}>
        {formatCurrency(value, currency)}
      </p>
      {change !== undefined && (
        <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{formatChange(change)}</span>
        </div>
      )}
    </motion.div>
  )
}

export default ReportSummaryCard
