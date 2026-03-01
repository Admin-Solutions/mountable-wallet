import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowUpRight, ArrowDownLeft, Filter, X } from 'lucide-react'
import { formatCurrency } from '../../services/accountingService'

function TransactionRow({ transaction, currency, index }) {
  const isCredit = transaction.type === 'credit'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="mw-glass-card p-4 flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        {isCredit ? (
          <ArrowDownLeft className="w-5 h-5 text-green-400" />
        ) : (
          <ArrowUpRight className="w-5 h-5 text-red-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{transaction.description}</p>
        <div className="flex items-center gap-2 text-sm text-wallet-text-muted">
          <span>{new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span className="w-1 h-1 rounded-full bg-wallet-text-muted" />
          <span className="truncate">{transaction.category}</span>
        </div>
      </div>

      <span className={`font-semibold flex-shrink-0 ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
        {isCredit ? '+' : ''}{formatCurrency(transaction.amount, currency)}
      </span>
    </motion.div>
  )
}

function FilterPills({ filter, onFilterChange, onClear, categoryName }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {categoryName && (
        <div className="flex items-center gap-1 px-3 py-1 bg-wallet-accent/20 text-wallet-accent rounded-full text-sm">
          <span>{categoryName}</span>
          <button onClick={onClear} className="hover:text-wallet-accent-light">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex gap-1">
        <button
          onClick={() => onFilterChange({ ...filter, type: null })}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            !filter.type ? 'bg-wallet-bg-tertiary text-white' : 'bg-wallet-bg-tertiary/50 text-wallet-text-secondary hover:text-wallet-text'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange({ ...filter, type: 'credit' })}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-wallet-bg-tertiary/50 text-wallet-text-secondary hover:text-wallet-text'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => onFilterChange({ ...filter, type: 'debit' })}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter.type === 'debit' ? 'bg-red-500/20 text-red-400' : 'bg-wallet-bg-tertiary/50 text-wallet-text-secondary hover:text-wallet-text'
          }`}
        >
          Expenses
        </button>
      </div>
    </div>
  )
}

export function TransactionList({
  transactions = [],
  loading,
  error,
  currency = 'GBP',
  pagination,
  filter = {},
  onFilterChange,
  onLoadMore,
  onRefresh,
  drillDownCategory,
  onClearDrillDown,
}) {
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

  return (
    <div className="space-y-4">
      <FilterPills
        filter={filter}
        onFilterChange={onFilterChange}
        onClear={onClearDrillDown}
        categoryName={drillDownCategory?.name}
      />

      {loading && transactions.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-wallet-accent animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 text-wallet-text-muted">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No transactions found</p>
          {drillDownCategory && (
            <button
              onClick={onClearDrillDown}
              className="mt-4 text-wallet-accent hover:text-wallet-accent-light"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {transactions.map((txn, index) => (
              <TransactionRow key={txn.id} transaction={txn} currency={currency} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {pagination?.hasMore && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-wallet-bg-tertiary hover:bg-wallet-bg-secondary rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="text-center text-wallet-text-muted text-sm pt-4 border-t border-wallet-surface-border">
          Showing {transactions.length} of {pagination?.totalItems || transactions.length} transactions
        </div>
      )}
    </div>
  )
}

export default TransactionList
