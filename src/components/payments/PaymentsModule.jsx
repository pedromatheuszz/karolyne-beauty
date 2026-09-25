import { useMemo, useState } from 'react'

import Icon from '../ui/Icon'
import KPICard from '../ui/KPICard'
import StatusBadge from '../ui/StatusBadge'
import { formatCurrency, formatDate } from '../../lib/format'
import { paymentMethods, paymentStatuses } from '../../lib/constants'

const PaymentsModule = ({ payments = [], customers = [], onRegisterPayment }) => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({
    customerId: '',
    amount: '',
    method: paymentMethods[0],
    reference: '',
  })
  const [feedback, setFeedback] = useState('')

  const visiblePayments = useMemo(
    () =>
      (statusFilter === 'all' ? payments : payments.filter(p => p.status === statusFilter))
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date)),
    [payments, statusFilter],
  )

  const totals = useMemo(() => {
    const sumWhere = predicate =>
      payments.filter(predicate).reduce((sum, payment) => sum + payment.amount, 0)

    return {
      received: sumWhere(p => p.status === 'pago'),
      pending: sumWhere(p => p.status === 'pendente' || p.status === 'parcialmente pago'),
      overdue: sumWhere(p => p.status === 'atrasado'),
      all: sumWhere(() => true),
    }
  }, [payments])

  const handleFormChange = event => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = event => {
    event.preventDefault()
    const amount = Number(form.amount)

    if (!form.customerId || !Number.isFinite(amount) || amount <= 0) {
      setFeedback('Selecione a cliente e informe um valor maior que zero.')
      return
    }

    const customer = customers.find(c => String(c.id) === String(form.customerId))
    onRegisterPayment?.({
      customerId: form.customerId,
      customerName: customer?.name ?? '',
      amount,
      method: form.method,
      reference: form.reference || 'Atendimento avulso',
      date: new Date().toISOString().slice(0, 10),
      status: 'pago',
    })

    setForm({ customerId: '', amount: '', method: paymentMethods[0], reference: '' })
    setFeedback(`Recebimento de ${formatCurrency(amount)} registrado.`)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Recebido" value={totals.received} currency icon="card" tone="success" />
        <KPICard title="A receber" value={totals.pending} currency icon="clock" tone="warning" />
        <KPICard
          title="Em atraso"
          value={totals.overdue}
          currency
          icon="alert"
          tone={totals.overdue > 0 ? 'destructive' : 'default'}
        />
        <KPICard
          title="Total do período"
          value={totals.all}
          currency
          icon="trending"
          tone="accent"
        />
      </div>

      {/* Registro rápido */}
      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Registrar recebimento</h3>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-2">
            <label htmlFor="payment-customer" className="block text-sm font-medium mb-1.5">
              Cliente
            </label>
            <select
              id="payment-customer"
              name="customerId"
              value={form.customerId}
              onChange={handleFormChange}
              className="field"
            >
              <option value="">Selecione a cliente</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="payment-amount" className="block text-sm font-medium mb-1.5">
              Valor
            </label>
            <input
              id="payment-amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={handleFormChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="payment-method" className="block text-sm font-medium mb-1.5">
              Forma
            </label>
            <select
              id="payment-method"
              name="method"
              value={form.method}
              onChange={handleFormChange}
              className="field"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="payment-reference" className="block text-sm font-medium mb-1.5">
              Referência
            </label>
            <input
              id="payment-reference"
              name="reference"
              type="text"
              placeholder="Ex.: Drenagem avulsa"
              value={form.reference}
              onChange={handleFormChange}
              className="field"
            />
          </div>
          <button type="submit" className="btn-primary">
            <Icon name="plus" className="w-4 h-4" />
            Registrar
          </button>
        </form>

        {feedback && <p className="text-sm text-muted-foreground mt-3">{feedback}</p>}
      </div>

      {/* Lançamentos */}
      <div className="card-surface overflow-hidden">
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">Lançamentos</h3>
          <div className="flex flex-wrap gap-1.5">
            {['all', ...paymentStatuses].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {visiblePayments.length === 0 ? (
          <p className="empty-state">Nenhum lançamento nesta situação</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-y border-border bg-muted/40">
                  <th className="px-5 py-2.5 font-medium text-xs">Cliente</th>
                  <th className="px-5 py-2.5 font-medium text-xs">Referência</th>
                  <th className="px-5 py-2.5 font-medium text-xs text-right">Valor</th>
                  <th className="px-5 py-2.5 font-medium text-xs">Data</th>
                  <th className="px-5 py-2.5 font-medium text-xs">Forma</th>
                  <th className="px-5 py-2.5 font-medium text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {visiblePayments.map(payment => (
                  <tr
                    key={payment.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium">{payment.customerName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{payment.reference}</td>
                    <td className="px-5 py-3 text-right real">{formatCurrency(payment.amount)}</td>
                    <td className="px-5 py-3">{formatDate(payment.date)}</td>
                    <td className="px-5 py-3">{payment.method}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentsModule
