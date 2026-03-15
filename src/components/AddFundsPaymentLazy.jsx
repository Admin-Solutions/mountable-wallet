const CDN_JS = `https://image.admin.solutions/mountable-payment-form-as-java-script-file-${Math.random().toString(36).slice(2)}/58854df7-05b1-401d-a35e-4b7f1e407fc2/8ab40251-b604-49ed-8bf1-b49c75532248/5c36a038-6717-4e9e-ba53-238ae24e0a05`

let bundlePromise = null

function loadScript() {
  if (bundlePromise) return bundlePromise
  bundlePromise = new Promise((resolve, reject) => {
    if (window.NexusPaymentForm?.open) { resolve(); return }
    const s = document.createElement('script')
    s.src = CDN_JS
    s.async = true
    s.onload = resolve
    s.onerror = () => { bundlePromise = null; reject(new Error('Failed to load payment form')) }
    document.head.appendChild(s)
  })
  return bundlePromise
}

export function openAddFunds({ currency, entityGuid, entityName, onClose } = {}) {
  loadScript()
    .then(() => {
      if (!window.NexusPaymentForm?.open) throw new Error('NexusPaymentForm.open not found')
      window.NexusPaymentForm.open({ currency, entityGuid, entityName, onClose })
    })
    .catch((err) => {
      console.error('[AddFundsPaymentLazy]', err)
      onClose?.()
    })
}
