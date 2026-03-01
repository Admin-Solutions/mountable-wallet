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
      className="space-y-6"
    >
      <div className="text-center">
        <p className="text-wallet-text-muted text-sm">{data.period?.label}</p>
      </div>

      <div className="flex gap-3">
        <ReportSummaryCard label="Revenue" value={data.revenue.total} currency={currency} change={revenueChange} variant="revenue" index={0} />
        <ReportSummaryCard label="Expenses" value={data.expenses.total} currency={currency} change={expenseChange} variant="expense" index={1} />
        <ReportSummaryCard label="Net Income" value={data.netIncome} currency={currency} change={data.changeFromPrevious} variant="net" index={2} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mw-glass-card p-4 flex items-center justify-between ${data.netIncome >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}
      >
        <div className="flex items-center gap-3">
          {data.netIncome >= 0 ? (
            <TrendingUp className="w-6 h-6 text-green-400" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-400" />
          )}
          <div>
            <p className="text-sm text-wallet-text-muted">
              {data.netIncome >= 0 ? 'Profit' : 'Loss'}
            </p>
            <p className={`text-lg font-bold ${data.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(data.netIncome), currency)}
            </p>
          </div>
        </div>
        <div className={`text-sm ${data.changeFromPrevious >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatChange(data.changeFromPrevious)} vs prior
        </div>
      </motion.div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Revenue
        </h3>
        <div className="space-y-2">
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
        <div className="mt-2 px-4 py-2 bg-green-500/5 rounded-lg flex justify-between items-center">
          <span className="text-wallet-text-muted text-sm">Total Revenue</span>
          <span className="font-semibold text-green-400">
            {formatCurrency(data.revenue.total, currency)}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Expenses
        </h3>
        <div className="space-y-2">
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
        <div className="mt-2 px-4 py-2 bg-red-500/5 rounded-lg flex justify-between items-center">
          <span className="text-wallet-text-muted text-sm">Total Expenses</span>
          <span className="font-semibold text-red-400">
            {formatCurrency(data.expenses.total, currency)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default ProfitLossReport
