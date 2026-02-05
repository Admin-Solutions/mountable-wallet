import { motion } from 'framer-motion'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { ReportSummaryCard } from './ReportSummaryCard'
import { LineItemRow } from './LineItemRow'
import { formatCurrency, formatChange } from '../../services/accountingService'

export function ProfitLossReport({
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

  const revenueChange = data.previousNetIncome
    ? ((data.revenue.total / (data.previousNetIncome + data.expenses.total)) - 1) * 100
    : 0
  const expenseChange = data.previousNetIncome
    ? ((data.expenses.total / (data.previousNetIncome - data.netIncome + data.expenses.total)) - 1) * 100
    : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mw-space-y-6"
    >
      <div className="mw-text-center">
        <p className="mw-text-wallet-text-muted mw-text-sm">{data.period?.label}</p>
      </div>

      <div className="mw-flex mw-gap-3">
        <ReportSummaryCard label="Revenue" value={data.revenue.total} currency={currency} change={revenueChange} variant="revenue" index={0} />
        <ReportSummaryCard label="Expenses" value={data.expenses.total} currency={currency} change={expenseChange} variant="expense" index={1} />
        <ReportSummaryCard label="Net Income" value={data.netIncome} currency={currency} change={data.changeFromPrevious} variant="net" index={2} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mw-glass-card mw-p-4 mw-flex mw-items-center mw-justify-between ${data.netIncome >= 0 ? 'mw-bg-green-500/10' : 'mw-bg-red-500/10'}`}
      >
        <div className="mw-flex mw-items-center mw-gap-3">
          {data.netIncome >= 0 ? (
            <TrendingUp className="mw-w-6 mw-h-6 mw-text-green-400" />
          ) : (
            <TrendingDown className="mw-w-6 mw-h-6 mw-text-red-400" />
          )}
          <div>
            <p className="mw-text-sm mw-text-wallet-text-muted">
              {data.netIncome >= 0 ? 'Profit' : 'Loss'}
            </p>
            <p className={`mw-text-lg mw-font-bold ${data.netIncome >= 0 ? 'mw-text-green-400' : 'mw-text-red-400'}`}>
              {formatCurrency(Math.abs(data.netIncome), currency)}
            </p>
          </div>
        </div>
        <div className={`mw-text-sm ${data.changeFromPrevious >= 0 ? 'mw-text-green-400' : 'mw-text-red-400'}`}>
          {formatChange(data.changeFromPrevious)} vs prior
        </div>
      </motion.div>

      <div>
        <h3 className="mw-text-lg mw-font-semibold mw-mb-3 mw-flex mw-items-center mw-gap-2">
          <span className="mw-w-2 mw-h-2 mw-rounded-full mw-bg-green-400" />
          Revenue
        </h3>
        <div className="mw-space-y-2">
          {data.revenue.items.map((item, index) => (
            <LineItemRow
              key={item.id}
              name={item.name}
              amount={item.amount}
              currency={currency}
              transactions={item.transactions}
              variant="revenue"
              index={index}
              onClick={() => onDrillDown?.(item.categoryId, item.name)}
            />
          ))}
        </div>
        <div className="mw-mt-2 mw-px-4 mw-py-2 mw-bg-green-500/5 mw-rounded-lg mw-flex mw-justify-between mw-items-center">
          <span className="mw-text-wallet-text-muted mw-text-sm">Total Revenue</span>
          <span className="mw-font-semibold mw-text-green-400">
            {formatCurrency(data.revenue.total, currency)}
          </span>
        </div>
      </div>

      <div>
        <h3 className="mw-text-lg mw-font-semibold mw-mb-3 mw-flex mw-items-center mw-gap-2">
          <span className="mw-w-2 mw-h-2 mw-rounded-full mw-bg-red-400" />
          Expenses
        </h3>
        <div className="mw-space-y-2">
          {data.expenses.items.map((item, index) => (
            <LineItemRow
              key={item.id}
              name={item.name}
              amount={item.amount}
              currency={currency}
              transactions={item.transactions}
              variant="expense"
              index={index}
              onClick={() => onDrillDown?.(item.categoryId, item.name)}
            />
          ))}
        </div>
        <div className="mw-mt-2 mw-px-4 mw-py-2 mw-bg-red-500/5 mw-rounded-lg mw-flex mw-justify-between mw-items-center">
          <span className="mw-text-wallet-text-muted mw-text-sm">Total Expenses</span>
          <span className="mw-font-semibold mw-text-red-400">
            {formatCurrency(data.expenses.total, currency)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default ProfitLossReport
