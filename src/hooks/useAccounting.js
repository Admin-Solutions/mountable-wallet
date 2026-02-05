import { useState, useEffect, useCallback } from 'react'
import {
  getProfitLoss,
  getBalanceSheet,
  getTransactions,
  periodOptions,
} from '../services/accountingService'

/**
 * Hook for managing accounting data
 */
export function useAccounting({ currencyCode: initialCurrency = 'GBP' } = {}) {
  const [currencyCode, setCurrencyCode] = useState(initialCurrency)
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [activeTab, setActiveTab] = useState('pl')

  // P&L data
  const [profitLoss, setProfitLoss] = useState(null)
  const [plLoading, setPlLoading] = useState(false)
  const [plError, setPlError] = useState(null)

  // Balance sheet data
  const [balanceSheet, setBalanceSheet] = useState(null)
  const [bsLoading, setBsLoading] = useState(false)
  const [bsError, setBsError] = useState(null)

  // Transactions data
  const [transactions, setTransactions] = useState([])
  const [txnLoading, setTxnLoading] = useState(false)
  const [txnError, setTxnError] = useState(null)
  const [txnPagination, setTxnPagination] = useState(null)
  const [txnFilter, setTxnFilter] = useState({ categoryId: null, type: null })

  // Drill-down state
  const [drillDownCategory, setDrillDownCategory] = useState(null)

  const fetchProfitLoss = useCallback(async () => {
    setPlLoading(true)
    setPlError(null)
    try {
      const result = await getProfitLoss({ periodId: selectedPeriod, currencyCode })
      if (result.success) {
        setProfitLoss(result.data)
      } else {
        setPlError(result.error || 'Failed to load P&L data')
      }
    } catch (err) {
      setPlError(err.message || 'Failed to load P&L data')
    } finally {
      setPlLoading(false)
    }
  }, [selectedPeriod, currencyCode])

  const fetchBalanceSheet = useCallback(async () => {
    setBsLoading(true)
    setBsError(null)
    try {
      const result = await getBalanceSheet({ periodId: selectedPeriod, currencyCode })
      if (result.success) {
        setBalanceSheet(result.data)
      } else {
        setBsError(result.error || 'Failed to load balance sheet')
      }
    } catch (err) {
      setBsError(err.message || 'Failed to load balance sheet')
    } finally {
      setBsLoading(false)
    }
  }, [selectedPeriod, currencyCode])

  const fetchTransactions = useCallback(async (page = 1, append = false) => {
    setTxnLoading(true)
    setTxnError(null)
    try {
      const result = await getTransactions({
        categoryId: txnFilter.categoryId,
        type: txnFilter.type,
        page,
      })
      if (result.success) {
        if (append) {
          setTransactions(prev => [...prev, ...result.transactions])
        } else {
          setTransactions(result.transactions)
        }
        setTxnPagination(result.pagination)
      } else {
        setTxnError(result.error || 'Failed to load transactions')
      }
    } catch (err) {
      setTxnError(err.message || 'Failed to load transactions')
    } finally {
      setTxnLoading(false)
    }
  }, [txnFilter])

  const loadMoreTransactions = useCallback(() => {
    if (txnPagination?.hasMore && !txnLoading) {
      fetchTransactions(txnPagination.page + 1, true)
    }
  }, [txnPagination, txnLoading, fetchTransactions])

  useEffect(() => {
    if (activeTab === 'pl') {
      fetchProfitLoss()
    } else if (activeTab === 'balance') {
      fetchBalanceSheet()
    } else if (activeTab === 'transactions') {
      fetchTransactions()
    }
  }, [activeTab, selectedPeriod, currencyCode])

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions()
    }
  }, [txnFilter])

  const drillDown = useCallback((categoryId, categoryName) => {
    setDrillDownCategory({ id: categoryId, name: categoryName })
    setTxnFilter({ categoryId, type: null })
    setActiveTab('transactions')
  }, [])

  const clearDrillDown = useCallback(() => {
    setDrillDownCategory(null)
    setTxnFilter({ categoryId: null, type: null })
  }, [])

  const changeCurrency = useCallback((code) => setCurrencyCode(code), [])
  const changePeriod = useCallback((periodId) => setSelectedPeriod(periodId), [])

  const changeTab = useCallback((tab) => {
    if (tab !== 'transactions') {
      setDrillDownCategory(null)
      setTxnFilter({ categoryId: null, type: null })
    }
    setActiveTab(tab)
  }, [])

  const refresh = useCallback(() => {
    if (activeTab === 'pl') fetchProfitLoss()
    else if (activeTab === 'balance') fetchBalanceSheet()
    else if (activeTab === 'transactions') fetchTransactions()
  }, [activeTab, fetchProfitLoss, fetchBalanceSheet, fetchTransactions])

  return {
    currencyCode,
    changeCurrency,
    selectedPeriod,
    changePeriod,
    periodOptions,
    activeTab,
    changeTab,
    profitLoss,
    plLoading,
    plError,
    fetchProfitLoss,
    balanceSheet,
    bsLoading,
    bsError,
    fetchBalanceSheet,
    transactions,
    txnLoading,
    txnError,
    txnPagination,
    txnFilter,
    setTxnFilter,
    fetchTransactions,
    loadMoreTransactions,
    drillDownCategory,
    drillDown,
    clearDrillDown,
    refresh,
  }
}

export default useAccounting
