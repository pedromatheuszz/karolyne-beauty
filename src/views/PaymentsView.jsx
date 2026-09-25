import { useMemo } from 'react'

import PaymentsModule from '../components/payments/PaymentsModule'
import { filterByDate } from '../lib/dateFilters'

const PaymentsView = ({ payments, customers, currentFilter, onRegisterPayment }) => {
  const scoped = useMemo(() => filterByDate(payments, currentFilter), [payments, currentFilter])

  return (
    <PaymentsModule
      payments={scoped}
      customers={customers}
      onRegisterPayment={onRegisterPayment}
    />
  )
}

export default PaymentsView
