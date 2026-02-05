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
    default: { bg: 'mw-bg-wallet-bg-tertiary/50', text: 'mw-text-wallet-text', accent: 'mw-text-wallet-accent' },
    revenue: { bg: 'mw-bg-green-500/10', text: 'mw-text-green-400', accent: 'mw-text-green-400' },
    expense: { bg: 'mw-bg-red-500/10', text: 'mw-text-red-400', accent: 'mw-text-red-400' },
    net: { bg: 'mw-bg-wallet-accent/10', text: 'mw-text-wallet-accent', accent: 'mw-text-wallet-accent' },
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
        mw-glass-card mw-p-4 mw-text-center mw-flex-1 mw-min-w-0
        ${onClick ? 'mw-cursor-pointer hover:mw-bg-wallet-surface-hover active:mw-scale-[0.98] mw-transition-all' : ''}
        ${style.bg}
      `}
    >
      <p className="mw-text-wallet-text-muted mw-text-xs mw-uppercase mw-tracking-wider mw-mb-1">{label}</p>
      <p className={`mw-text-xl mw-font-bold mw-truncate ${style.text}`}>
        {formatCurrency(value, currency)}
      </p>
      {change !== undefined && (
        <div className={`mw-flex mw-items-center mw-justify-center mw-gap-1 mw-mt-1 mw-text-xs ${isPositiveChange ? 'mw-text-green-400' : 'mw-text-red-400'}`}>
          <TrendIcon className="mw-w-3 mw-h-3" />
          <span>{formatChange(change)}</span>
        </div>
      )}
    </motion.div>
  )
}

export default ReportSummaryCard
