import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Same CDN bundle as nexus-ui — the payment form is a self-contained IIFE that
// sets window.NexusPaymentForm.  Random segment is a cache-buster.
const CDN_JS = `https://image.admin.solutions/mountable-payment-form-as-java-script-file-${Math.random().toString(36).slice(2)}/58854df7-05b1-401d-a35e-4b7f1e407fc2/8ab40251-b604-49ed-8bf1-b49c75532248/5c36a038-6717-4e9e-ba53-238ae24e0a05`

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.NexusPaymentForm) { resolve(); return }
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)))
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = () => reject(new Error('Failed to load payment form from CDN'))
    document.head.appendChild(s)
  })
}

const LazyFlow = lazy(() =>
  loadScript(CDN_JS).then(() => ({
    default: window.NexusPaymentForm.AddFundsFlow,
  }))
)

function Skeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5">
      <Loader2 className="w-8 h-8 text-wallet-accent animate-spin mb-4" />
      <p className="text-wallet-text-muted text-sm">Loading payment form…</p>
    </div>
  )
}

/**
 * AddFundsFlow — lazy-loaded from CDN IIFE bundle.
 * Full onramp flow: method selector → ledger selector → payment form.
 * Props: onClose, onrampMethods, ledgers, onSubmitPayment
 */
export function AddFundsFlow(props) {
  return (
    <Suspense fallback={<Skeleton />}>
      <LazyFlow {...props} />
    </Suspense>
  )
}
