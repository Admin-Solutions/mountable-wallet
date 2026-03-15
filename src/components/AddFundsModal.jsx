import { openAddFunds } from './AddFundsPaymentLazy'

export function openAddFundsModal({ currency, entityGuid, entityName, onClose } = {}) {
  openAddFunds({ currency, entityGuid, entityName, onClose })
}

export default openAddFundsModal
