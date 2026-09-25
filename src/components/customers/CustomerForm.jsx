import { useState } from 'react'

const CustomerForm = ({ customer, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    birthDate: customer?.birthDate ?? '',
    address: customer?.address ?? '',
    notes: customer?.notes ?? '',
    outstandingBalance: customer?.outstandingBalance ?? 0,
  })
  const [error, setError] = useState('')

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'outstandingBalance' ? (value === '' ? '' : Number(value)) : value,
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!formData.name.trim()) {
      setError('O nome da cliente é obrigatório.')
      return
    }
    if (!formData.phone.trim()) {
      setError('O telefone é obrigatório — é por ele que o WhatsApp funciona.')
      return
    }

    setError('')
    onSubmit({
      ...customer,
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      outstandingBalance: Number(formData.outstandingBalance) || 0,
      // Data de cadastro só é definida na criação, nunca sobrescrita na edição.
      registrationDate: customer?.registrationDate ?? new Date().toISOString().slice(0, 10),
    })
    onClose?.()
  }

  return (
    <div className="card-surface p-5">
      <h3 className="font-display text-lg font-semibold mb-4">
        {customer ? 'Editar cliente' : 'Nova cliente'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cus-name" className="block text-sm font-medium mb-1.5">
              Nome completo
            </label>
            <input
              id="cus-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="cus-phone" className="block text-sm font-medium mb-1.5">
              Telefone / WhatsApp
            </label>
            <input
              id="cus-phone"
              name="phone"
              type="tel"
              placeholder="(47) 99999-0000"
              value={formData.phone}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="cus-email" className="block text-sm font-medium mb-1.5">
              E-mail
            </label>
            <input
              id="cus-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="cus-birth" className="block text-sm font-medium mb-1.5">
              Data de nascimento
            </label>
            <input
              id="cus-birth"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="cus-address" className="block text-sm font-medium mb-1.5">
              Endereço
            </label>
            <input
              id="cus-address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="cus-balance" className="block text-sm font-medium mb-1.5">
              Saldo em aberto
            </label>
            <input
              id="cus-balance"
              name="outstandingBalance"
              type="number"
              min="0"
              step="0.01"
              value={formData.outstandingBalance}
              onChange={handleChange}
              className="field"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cus-notes" className="block text-sm font-medium mb-1.5">
            Observações
          </label>
          <textarea
            id="cus-notes"
            name="notes"
            rows={3}
            placeholder="Alergias, preferências de horário, indicações…"
            value={formData.notes}
            onChange={handleChange}
            className="field resize-none"
          />
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
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}

export default CustomerForm
