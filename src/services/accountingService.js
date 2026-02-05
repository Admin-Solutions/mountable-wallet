/**
 * Accounting Service
 * Provides mock data for P&L and Balance Sheet reports
 * Structured for future API integration
 */

// Mock P&L data by period
const mockProfitLossData = {
  'this-month': {
    period: { start: '2024-01-01', end: '2024-01-31', label: 'January 2024' },
    revenue: {
      total: 45230,
      items: [
        { id: 'rev-1', name: 'Token Sales', amount: 28500, transactions: 47, categoryId: 'token-sales' },
        { id: 'rev-2', name: 'NFT Royalties', amount: 12300, transactions: 156, categoryId: 'nft-royalties' },
        { id: 'rev-3', name: 'Service Fees', amount: 4430, transactions: 23, categoryId: 'service-fees' },
      ]
    },
    expenses: {
      total: 18720,
      items: [
        { id: 'exp-1', name: 'Gas Fees', amount: 8200, transactions: 234, categoryId: 'gas-fees' },
        { id: 'exp-2', name: 'Platform Fees', amount: 6120, transactions: 47, categoryId: 'platform-fees' },
        { id: 'exp-3', name: 'Marketing', amount: 4400, transactions: 12, categoryId: 'marketing' },
      ]
    },
    netIncome: 26510,
    previousNetIncome: 23580,
    changeFromPrevious: 12.4,
  },
  'last-month': {
    period: { start: '2023-12-01', end: '2023-12-31', label: 'December 2023' },
    revenue: {
      total: 38750,
      items: [
        { id: 'rev-1', name: 'Token Sales', amount: 22100, transactions: 38, categoryId: 'token-sales' },
        { id: 'rev-2', name: 'NFT Royalties', amount: 11200, transactions: 142, categoryId: 'nft-royalties' },
        { id: 'rev-3', name: 'Service Fees', amount: 5450, transactions: 31, categoryId: 'service-fees' },
      ]
    },
    expenses: {
      total: 15170,
      items: [
        { id: 'exp-1', name: 'Gas Fees', amount: 6800, transactions: 198, categoryId: 'gas-fees' },
        { id: 'exp-2', name: 'Platform Fees', amount: 5220, transactions: 38, categoryId: 'platform-fees' },
        { id: 'exp-3', name: 'Marketing', amount: 3150, transactions: 8, categoryId: 'marketing' },
      ]
    },
    netIncome: 23580,
    previousNetIncome: 21200,
    changeFromPrevious: 11.2,
  },
  'q1': {
    period: { start: '2024-01-01', end: '2024-03-31', label: 'Q1 2024' },
    revenue: {
      total: 142850,
      items: [
        { id: 'rev-1', name: 'Token Sales', amount: 89200, transactions: 156, categoryId: 'token-sales' },
        { id: 'rev-2', name: 'NFT Royalties', amount: 38400, transactions: 487, categoryId: 'nft-royalties' },
        { id: 'rev-3', name: 'Service Fees', amount: 15250, transactions: 72, categoryId: 'service-fees' },
      ]
    },
    expenses: {
      total: 58420,
      items: [
        { id: 'exp-1', name: 'Gas Fees', amount: 25600, transactions: 712, categoryId: 'gas-fees' },
        { id: 'exp-2', name: 'Platform Fees', amount: 19320, transactions: 156, categoryId: 'platform-fees' },
        { id: 'exp-3', name: 'Marketing', amount: 13500, transactions: 34, categoryId: 'marketing' },
      ]
    },
    netIncome: 84430,
    previousNetIncome: 72150,
    changeFromPrevious: 17.0,
  },
  'ytd': {
    period: { start: '2024-01-01', end: '2024-12-31', label: 'Year to Date' },
    revenue: {
      total: 542680,
      items: [
        { id: 'rev-1', name: 'Token Sales', amount: 328500, transactions: 612, categoryId: 'token-sales' },
        { id: 'rev-2', name: 'NFT Royalties', amount: 156800, transactions: 1847, categoryId: 'nft-royalties' },
        { id: 'rev-3', name: 'Service Fees', amount: 57380, transactions: 284, categoryId: 'service-fees' },
      ]
    },
    expenses: {
      total: 218740,
      items: [
        { id: 'exp-1', name: 'Gas Fees', amount: 98200, transactions: 2834, categoryId: 'gas-fees' },
        { id: 'exp-2', name: 'Platform Fees', amount: 72340, transactions: 612, categoryId: 'platform-fees' },
        { id: 'exp-3', name: 'Marketing', amount: 48200, transactions: 128, categoryId: 'marketing' },
      ]
    },
    netIncome: 323940,
    previousNetIncome: 278500,
    changeFromPrevious: 16.3,
  },
}

// Mock Balance Sheet data
const mockBalanceSheetData = {
  'this-month': {
    asOf: '2024-01-31',
    assets: {
      current: {
        total: 124850,
        items: [
          { id: 'asset-1', name: 'Cash & Equivalents', amount: 45200, categoryId: 'cash' },
          { id: 'asset-2', name: 'Token Holdings', amount: 52300, categoryId: 'tokens' },
          { id: 'asset-3', name: 'NFT Inventory', amount: 18750, categoryId: 'nft-inventory' },
          { id: 'asset-4', name: 'Accounts Receivable', amount: 8600, categoryId: 'receivables' },
        ]
      },
      longTerm: {
        total: 85000,
        items: [
          { id: 'asset-5', name: 'Long-term Investments', amount: 65000, categoryId: 'investments' },
          { id: 'asset-6', name: 'Digital Property', amount: 20000, categoryId: 'digital-property' },
        ]
      },
      total: 209850,
    },
    liabilities: {
      current: {
        total: 12500,
        items: [
          { id: 'liab-1', name: 'Accounts Payable', amount: 7200, categoryId: 'payables' },
          { id: 'liab-2', name: 'Accrued Expenses', amount: 3800, categoryId: 'accrued' },
          { id: 'liab-3', name: 'Deferred Revenue', amount: 1500, categoryId: 'deferred' },
        ]
      },
      longTerm: {
        total: 0,
        items: []
      },
      total: 12500,
    },
    equity: {
      total: 197350,
      items: [
        { id: 'eq-1', name: 'Retained Earnings', amount: 170840, categoryId: 'retained' },
        { id: 'eq-2', name: 'Current Period Net', amount: 26510, categoryId: 'current-net' },
      ]
    },
  },
  'last-month': {
    asOf: '2023-12-31',
    assets: {
      current: {
        total: 118420,
        items: [
          { id: 'asset-1', name: 'Cash & Equivalents', amount: 42100, categoryId: 'cash' },
          { id: 'asset-2', name: 'Token Holdings', amount: 48900, categoryId: 'tokens' },
          { id: 'asset-3', name: 'NFT Inventory', amount: 19820, categoryId: 'nft-inventory' },
          { id: 'asset-4', name: 'Accounts Receivable', amount: 7600, categoryId: 'receivables' },
        ]
      },
      longTerm: {
        total: 85000,
        items: [
          { id: 'asset-5', name: 'Long-term Investments', amount: 65000, categoryId: 'investments' },
          { id: 'asset-6', name: 'Digital Property', amount: 20000, categoryId: 'digital-property' },
        ]
      },
      total: 203420,
    },
    liabilities: {
      current: {
        total: 14580,
        items: [
          { id: 'liab-1', name: 'Accounts Payable', amount: 8900, categoryId: 'payables' },
          { id: 'liab-2', name: 'Accrued Expenses', amount: 4180, categoryId: 'accrued' },
          { id: 'liab-3', name: 'Deferred Revenue', amount: 1500, categoryId: 'deferred' },
        ]
      },
      longTerm: {
        total: 0,
        items: []
      },
      total: 14580,
    },
    equity: {
      total: 188840,
      items: [
        { id: 'eq-1', name: 'Retained Earnings', amount: 165260, categoryId: 'retained' },
        { id: 'eq-2', name: 'Current Period Net', amount: 23580, categoryId: 'current-net' },
      ]
    },
  },
}

// Mock transactions data
const mockTransactions = [
  { id: 'txn-001', date: '2024-01-31', description: 'Token Sale - Premium Pack', amount: 1250, type: 'credit', categoryId: 'token-sales', category: 'Token Sales' },
  { id: 'txn-002', date: '2024-01-31', description: 'Gas Fee - Ethereum', amount: -45.20, type: 'debit', categoryId: 'gas-fees', category: 'Gas Fees' },
  { id: 'txn-003', date: '2024-01-30', description: 'NFT Royalty - Collection A', amount: 89.50, type: 'credit', categoryId: 'nft-royalties', category: 'NFT Royalties' },
  { id: 'txn-004', date: '2024-01-30', description: 'Platform Fee - OpenSea', amount: -62.30, type: 'debit', categoryId: 'platform-fees', category: 'Platform Fees' },
  { id: 'txn-005', date: '2024-01-29', description: 'Token Sale - Standard Pack', amount: 450, type: 'credit', categoryId: 'token-sales', category: 'Token Sales' },
  { id: 'txn-006', date: '2024-01-29', description: 'Marketing - Twitter Ads', amount: -320, type: 'debit', categoryId: 'marketing', category: 'Marketing' },
  { id: 'txn-007', date: '2024-01-28', description: 'Service Fee - API Access', amount: 175, type: 'credit', categoryId: 'service-fees', category: 'Service Fees' },
  { id: 'txn-008', date: '2024-01-28', description: 'Gas Fee - Polygon', amount: -12.80, type: 'debit', categoryId: 'gas-fees', category: 'Gas Fees' },
  { id: 'txn-009', date: '2024-01-27', description: 'NFT Royalty - Collection B', amount: 156.25, type: 'credit', categoryId: 'nft-royalties', category: 'NFT Royalties' },
  { id: 'txn-010', date: '2024-01-27', description: 'Token Sale - Bulk Order', amount: 3200, type: 'credit', categoryId: 'token-sales', category: 'Token Sales' },
  { id: 'txn-011', date: '2024-01-26', description: 'Platform Fee - Rarible', amount: -89.50, type: 'debit', categoryId: 'platform-fees', category: 'Platform Fees' },
  { id: 'txn-012', date: '2024-01-26', description: 'Gas Fee - Ethereum', amount: -78.40, type: 'debit', categoryId: 'gas-fees', category: 'Gas Fees' },
  { id: 'txn-013', date: '2024-01-25', description: 'Service Fee - Premium Support', amount: 250, type: 'credit', categoryId: 'service-fees', category: 'Service Fees' },
  { id: 'txn-014', date: '2024-01-25', description: 'NFT Royalty - Collection A', amount: 67.80, type: 'credit', categoryId: 'nft-royalties', category: 'NFT Royalties' },
  { id: 'txn-015', date: '2024-01-24', description: 'Marketing - Discord Campaign', amount: -450, type: 'debit', categoryId: 'marketing', category: 'Marketing' },
  { id: 'txn-016', date: '2024-01-24', description: 'Token Sale - Limited Edition', amount: 2800, type: 'credit', categoryId: 'token-sales', category: 'Token Sales' },
  { id: 'txn-017', date: '2024-01-23', description: 'Gas Fee - BSC', amount: -8.50, type: 'debit', categoryId: 'gas-fees', category: 'Gas Fees' },
  { id: 'txn-018', date: '2024-01-23', description: 'Platform Fee - Foundation', amount: -125, type: 'debit', categoryId: 'platform-fees', category: 'Platform Fees' },
  { id: 'txn-019', date: '2024-01-22', description: 'NFT Royalty - Collection C', amount: 234.60, type: 'credit', categoryId: 'nft-royalties', category: 'NFT Royalties' },
  { id: 'txn-020', date: '2024-01-22', description: 'Service Fee - Consultation', amount: 500, type: 'credit', categoryId: 'service-fees', category: 'Service Fees' },
]

// Period options for date picker
export const periodOptions = [
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'q1', label: 'Q1' },
  { id: 'ytd', label: 'Year to Date' },
]

/**
 * Get Profit & Loss report
 */
export async function getProfitLoss({ periodId = 'this-month', currencyCode = 'GBP' } = {}) {
  await new Promise(resolve => setTimeout(resolve, 300))
  const data = mockProfitLossData[periodId] || mockProfitLossData['this-month']
  return {
    success: true,
    data: { ...data, currency: currencyCode },
  }
}

/**
 * Get Balance Sheet report
 */
export async function getBalanceSheet({ periodId = 'this-month', currencyCode = 'GBP' } = {}) {
  await new Promise(resolve => setTimeout(resolve, 300))
  const data = mockBalanceSheetData[periodId] || mockBalanceSheetData['this-month']
  return {
    success: true,
    data: { ...data, currency: currencyCode },
  }
}

/**
 * Get transactions with optional filtering
 */
export async function getTransactions({ categoryId, type, page = 1, pageSize = 20 } = {}) {
  await new Promise(resolve => setTimeout(resolve, 200))
  let filtered = [...mockTransactions]
  if (categoryId) {
    filtered = filtered.filter(txn => txn.categoryId === categoryId)
  }
  if (type) {
    filtered = filtered.filter(txn => txn.type === type)
  }
  const startIndex = (page - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)
  return {
    success: true,
    transactions: paginated,
    pagination: {
      page,
      pageSize,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      hasMore: startIndex + pageSize < filtered.length,
    },
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount, currencyCode = 'GBP') {
  const symbols = { GBP: '\u00A3', USD: '$', EUR: '\u20AC', BHC: 'BHC ' }
  const symbol = symbols[currencyCode] || currencyCode + ' '
  const absAmount = Math.abs(amount)
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`
}

/**
 * Format percentage change
 */
export function formatChange(change) {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}
