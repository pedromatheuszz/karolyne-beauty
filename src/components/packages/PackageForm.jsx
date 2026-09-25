import { useMemo, useState } from 'react'

import { formatCurrency } from '../../lib/format'

const DAY = 24 * 60 * 60 * 1000

function isoToday() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10)
}

function isoPlusDays(days) {
  const now = new Date()
  const base = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return new Date(base + days * DAY).toISOString().slice(0, 10)
}

const PackageForm = ({ onSubmit, onClose, customers = [], services = [] }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    totalSessions: 10,
    discountPercent: 10,
    purchaseDate: isoToday(),
    expiresAt: isoPlusDays(90),
  })
  const [error, setError] = useState('')

  const selectedService = services.find(s => String(s.id) === String(formData.serviceId))

  const pricing = useMemo(() => {
    const sessions = Number(formData.totalSessions) || 0
    const unit = selectedService?.price ?? 0
    const gross = unit * sessions
    const discount = (gross * (Number(formData.discountPercent) || 0)) / 100
    return { gross, discount, total: gross - discount }
  }, [formData.totalSessions, formData.discountPercent, selectedService])

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = event => {
    event.preventDefault()

    const sessions = Number(formData.totalSessions)
    if (!formData.customerId || !formData.serviceId) {
      setError('Selecione a cliente e o serviço do pacote.')
      return
    }
    if (!Number.isInteger(sessions) || sessions < 2) {
      setError('Um pacote precisa ter pelo menos 2 sessões.')
      return
    }
    if (formData.expiresAt <= formData.purchaseDate) {
      setError('A validade deve ser posterior à data da compra.')
      return
    }

    setError('')
    const customer = customers.find(c => String(c.id) === String(formData.customerId))

    onSubmit({
      customerId: formData.customerId,
      customerName: customer?.name ?? '',
      serviceId: formData.serviceId,
      serviceName: selectedService?.name ?? '',
      totalSessions: sessions,
      usedSessions: 0,
      price: Math.round(pricing.total * 100) / 100,
      purchaseDate: formData.purchaseDate,
      expiresAt: formData.expiresAt,
      status: 'active',
    })
    onClose?.()
  }

  return (
    <div className="card-surface p-6">
      <h3 className="font-display text-lg font-semibold mb-5">Novo pacote de sessões</h3>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pkg-customer" className="block text-sm font-medium mb-1.5">
              Cliente
            </label>
            <select
              id="pkg-customer"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
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
            <label htmlFor="pkg-service" className="block text-sm font-medium mb-1.5">
              Serviço
            </label>
            <select
              id="pkg-service"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              className="field"
            >
              <option value="">Selecione o serviço</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} — {formatCurrency(service.price)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="pkg-sessions" className="block text-sm font-medium mb-1.5">
              Sessões
            </label>
            <input
              id="pkg-sessions"
              name="totalSessions"
              type="number"
              min="2"
              step="1"
              value={formData.totalSessions}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="pkg-discount" className="block text-sm font-medium mb-1.5">
              Desconto (%)
            </label>
            <input
              id="pkg-discount"
              name="discountPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              value={formData.discountPercent}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="pkg-purchase" className="block text-sm font-medium mb-1.5">
              Compra
            </label>
            <input
              id="pkg-purchase"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="pkg-expires" className="block text-sm font-medium mb-1.5">
              Validade
            </label>
            <input
              id="pkg-expires"
              name="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={handleChange}
              className="field"
            />
          </div>
        </div>

        <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground">
            {formData.totalSessions || 0} × {formatCurrency(selectedService?.price ?? 0)} −{' '}
            {formatCurrency(pricing.discount)} de desconto
          </span>
          <span className="font-display text-xl font-semibold real">
            {formatCurrency(pricing.total)}
          </span>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex-1">
            Criar pacote
          </button>
        </div>
      </form>
    </div>
  )
}

export default PackageForm
