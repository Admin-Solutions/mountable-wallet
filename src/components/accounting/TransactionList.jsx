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
      className="mw-glass-card mw-p-4 mw-flex mw-items-center mw-gap-3"
    >
      <div className={`mw-w-10 mw-h-10 mw-rounded-full mw-flex mw-items-center mw-justify-center mw-flex-shrink-0 ${isCredit ? 'mw-bg-green-500/20' : 'mw-bg-red-500/20'}`}>
        {isCredit ? (
          <ArrowDownLeft className="mw-w-5 mw-h-5 mw-text-green-400" />
        ) : (
          <ArrowUpRight className="mw-w-5 mw-h-5 mw-text-red-400" />
        )}
      </div>

      <div className="mw-flex-1 mw-min-w-0">
        <p className="mw-font-medium mw-truncate">{transaction.description}</p>
        <div className="mw-flex mw-items-center mw-gap-2 mw-text-sm mw-text-wallet-text-muted">
          <span>{new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span className="mw-w-1 mw-h-1 mw-rounded-full mw-bg-wallet-text-muted" />
          <span className="mw-truncate">{transaction.category}</span>
        </div>
      </div>

      <span className={`mw-font-semibold mw-flex-shrink-0 ${isCredit ? 'mw-text-green-400' : 'mw-text-red-400'}`}>
        {isCredit ? '+' : ''}{formatCurrency(transaction.amount, currency)}
      </span>
    </motion.div>
  )
}

function FilterPills({ filter, onFilterChange, onClear, categoryName }) {
  return (
    <div className="mw-flex mw-items-center mw-gap-2 mw-flex-wrap">
      {categoryName && (
        <div className="mw-flex mw-items-center mw-gap-1 mw-px-3 mw-py-1 mw-bg-wallet-accent/20 mw-text-wallet-accent mw-rounded-full mw-text-sm">
          <span>{categoryName}</span>
          <button onClick={onClear} className="hover:mw-text-wallet-accent-light">
            <X className="mw-w-3 mw-h-3" />
          </button>
        </div>
      )}

      <div className="mw-flex mw-gap-1">
        <button
          onClick={() => onFilterChange({ ...filter, type: null })}
          className={`mw-px-3 mw-py-1 mw-rounded-full mw-text-sm mw-transition-colors ${
            !filter.type ? 'mw-bg-wallet-bg-tertiary mw-text-white' : 'mw-bg-wallet-bg-tertiary/50 mw-text-wallet-text-secondary hover:mw-text-wallet-text'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange({ ...filter, type: 'credit' })}
          className={`mw-px-3 mw-py-1 mw-rounded-full mw-text-sm mw-transition-colors ${
            filter.type === 'credit' ? 'mw-bg-green-500/20 mw-text-green-400' : 'mw-bg-wallet-bg-tertiary/50 mw-text-wallet-text-secondary hover:mw-text-wallet-text'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => onFilterChange({ ...filter, type: 'debit' })}
          className={`mw-px-3 mw-py-1 mw-rounded-full mw-text-sm mw-transition-colors ${
            filter.type === 'debit' ? 'mw-bg-red-500/20 mw-text-red-400' : 'mw-bg-wallet-bg-tertiary/50 mw-text-wallet-text-secondary hover:mw-text-wallet-text'
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

  return (
    <div className="mw-space-y-4">
      <FilterPills
        filter={filter}
        onFilterChange={onFilterChange}
        onClear={onClearDrillDown}
        categoryName={drillDownCategory?.name}
      />

      {loading && transactions.length === 0 ? (
        <div className="mw-flex mw-items-center mw-justify-center mw-py-20">
          <Loader2 className="mw-w-8 mw-h-8 mw-text-wallet-accent mw-animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="mw-text-center mw-py-20 mw-text-wallet-text-muted">
          <Filter className="mw-w-12 mw-h-12 mw-mx-auto mw-mb-4 mw-opacity-50" />
          <p>No transactions found</p>
          {drillDownCategory && (
            <button
              onClick={onClearDrillDown}
              className="mw-mt-4 mw-text-wallet-accent hover:mw-text-wallet-accent-light"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="mw-space-y-2">
          <AnimatePresence>
            {transactions.map((txn, index) => (
              <TransactionRow key={txn.id} transaction={txn} currency={currency} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {pagination?.hasMore && (
        <div className="mw-text-center mw-py-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="mw-px-6 mw-py-3 mw-bg-wallet-bg-tertiary hover:mw-bg-wallet-bg-secondary mw-rounded-xl mw-transition-colors disabled:mw-opacity-50"
          >
            {loading ? (
              <span className="mw-flex mw-items-center mw-gap-2">
                <Loader2 className="mw-w-4 mw-h-4 mw-animate-spin" />
                Loading...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mw-text-center mw-text-wallet-text-muted mw-text-sm mw-pt-4 mw-border-t mw-border-wallet-surface-border">
          Showing {transactions.length} of {pagination?.totalItems || transactions.length} transactions
        </div>
      )}
    </div>
  )
}

export default TransactionList
