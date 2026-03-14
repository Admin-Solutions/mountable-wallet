import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { Loader2, AlertCircle } from 'lucide-react'
import { AddFundsFlow } from './AddFundsPaymentLazy'
import { universalPost } from '../api/universalApi'
import { useWalletConfig } from '../context/WalletConfigContext'

const ENDPOINT_ONRAMP      = '530ba997-f7b0-4f71-9d5a-2776b7fa9116'
const ENDPOINT_ENTITIES    = '080b1ef1-1345-4c26-8687-9dd73873cd9f'
const ENDPOINT_FUND        = 'c5a7023b-ffec-41e6-8639-a9421a8bfeef'

function mapOnrampMethods(values = []) {
  return values.map((item) => ({
    id:          item.onRampGUID,
    name:        item.onPageTitle,
    description: item.onPageText,
    type:        'card',
    currency: {
      symbol:                item.symbol,
      onPageTitle:           item.onPageTitle,
      onPageText:            item.onPageExpandedText || item.onPageText,
      practicalDecimalPlaces: item.practicalDecimalPlaces,
      onRampGUID:            item.onRampGUID,
    },
  }))
}

function mapLedgers(entities = []) {
  return entities.map((e) => ({
    id:               e.accountingEntityGuid,
    name:             e.accountingEntityName,
    balance:          e.balance ?? 0,
    ownershipPercent: e.percentageOwnership <= 1
      ? e.percentageOwnership * 100
      : e.percentageOwnership,
  }))
}

/**
 * Bottom-sheet wrapper for the add-funds onramp flow.
 *
 * @param {boolean}  isOpen
 * @param {function} onClose
 * @param {object}   currency  - normalized currency from WalletPage (must have .raid)
 */
export function AddFundsModal({ isOpen, onClose, currency }) {
  const { apiBaseUrl, authToken, entityAuth, onTransactionComplete, onAuthError } = useWalletConfig()

  const [onrampMethods, setOnrampMethods] = useState([])
  const [ledgers, setLedgers]             = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)

  const y = useMotionValue(0)
  const backdropOpacity = useTransform(y, [0, window.innerHeight], [1, 0])

  // Fetch onramp methods (filtered by currencyRAID) + accounting entities
  useEffect(() => {
    if (!isOpen || !currency) return

    setLoading(true)
    setError(null)

    Promise.all([
      universalPost(
        apiBaseUrl,
        ENDPOINT_ONRAMP,
        { '@FilterCurrencyRAID': currency.raid ?? 0 },
        authToken
      ),
      universalPost(
        apiBaseUrl,
        ENDPOINT_ENTITIES,
        {},
        authToken
      ),
    ])
      .then(([onrampRes, entitiesRes]) => {
        setOnrampMethods(mapOnrampMethods(onrampRes.value ?? []))
        setLedgers(mapLedgers(entitiesRes.value ?? []))
      })
      .catch((err) => {
        console.error('[AddFundsModal] failed to load data:', err)
        setError('Failed to load funding methods. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [isOpen, currency, apiBaseUrl, authToken])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setOnrampMethods([])
      setLedgers([])
      setError(null)
      y.set(0)
    }
  }, [isOpen, y])

  const handleClose = () => {
    animate(y, window.innerHeight, {
      type: 'spring', damping: 30, stiffness: 300,
      onComplete: onClose,
    })
  }

  const handleDragEnd = (event, info) => {
    if (info.offset.y > 80 || info.velocity.y > 300) {
      animate(y, window.innerHeight, {
        type: 'spring', damping: 30, stiffness: 300,
        velocity: info.velocity.y,
        onComplete: onClose,
      })
    } else {
      animate(y, 0, { type: 'spring', damping: 25, stiffness: 400 })
    }
  }

  const handleSubmitPayment = async (data) => {
    const result = await universalPost(
      apiBaseUrl,
      ENDPOINT_FUND,
      {
        '@OnRampGUID':            data.currency?.onRampGUID,
        '@GrossAmount':           parseFloat(data.amount),
        '@OrderNumber':           'AddFunds',
        '@CardNumber':            data.cardNumber,
        '@CardholderFirstName':   data.firstName,
        '@CardholderLastName':    data.lastName,
        '@CustomerFirstName':     data.firstName,
        '@CustomerLastName':      data.lastName,
        '@CustomerAddress1':      data.address  || null,
        '@CustomerZip':           data.postalCode || null,
        '@ExpirationDate':        data.expiry,
        '@CVV':                   data.cvc,
        '@EntityAuthUser':        entityAuth,
        '@FundSpecificAEGUID':    data.fundAll ? null : (data.selectedLedger?.id || null),
        '@SendReceipt':           0,
        '@Development':           import.meta.env.DEV ? 1 : 0,
      },
      authToken
    )

    const meta = result.value?.[0]?.meta || {}

    if (meta.IsSuccessful === '0' && meta.message === 'MustReauthorize') {
      onAuthError?.()
      handleClose()
      throw new Error('MustReauthorize')
    }

    if (meta.IsSuccessful === '0') {
      throw new Error(meta.message || 'Payment failed')
    }

    onTransactionComplete?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/50"
            style={{ opacity: backdropOpacity }}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            style={{ y, maxHeight: 'calc(100dvh - 1rem)' }}
            className="fixed bottom-0 left-0 right-0 z-[70] mw-glass-card rounded-t-3xl border-t border-white/10 flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 flex flex-col">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-wallet-accent animate-spin" />
                  <p className="text-wallet-text-muted text-sm">Loading funding methods…</p>
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-wallet-text-muted text-sm">{error}</p>
                </div>
              )}

              {!loading && !error && (
                <AddFundsFlow
                  onClose={handleClose}
                  onrampMethods={onrampMethods}
                  ledgers={ledgers}
                  onSubmitPayment={handleSubmitPayment}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AddFundsModal
