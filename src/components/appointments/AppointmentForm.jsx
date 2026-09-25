import { useState } from 'react'

import { formatCurrency } from '../../lib/format'

/** 'HH:MM' + minutes -> 'HH:MM', clamped to the same day. */
function addMinutes(startTime, minutes) {
  if (!startTime) return ''
  const [hours, mins] = startTime.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(mins)) return ''
  const total = Math.min(hours * 60 + mins + minutes, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const AppointmentForm = ({ onSubmit, onClose, appointment, services = [], customers = [] }) => {
  const [formData, setFormData] = useState({
    customerId: appointment?.customerId ?? '',
    serviceId: appointment?.serviceId ?? '',
    date: appointment?.date ?? '',
    startTime: appointment?.startTime ?? '',
    endTime: appointment?.endTime ?? '',
    status: appointment?.status ?? 'scheduled',
    notes: appointment?.notes ?? '',
  })
  const [error, setError] = useState('')

  // Select values arrive as strings; ids are numbers.
  const selectedService = services.find(s => String(s.id) === String(formData.serviceId))
  const selectedCustomer = customers.find(c => String(c.id) === String(formData.customerId))

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceChange = event => {
    const { value } = event.target
    const service = services.find(s => String(s.id) === value)
    setFormData(prev => ({
      ...prev,
      serviceId: value,
      // Keep the end time in sync with the service duration unless it was set by hand.
      endTime:
        service && prev.startTime ? addMinutes(prev.startTime, service.duration) : prev.endTime,
    }))
  }

  const handleStartTimeChange = event => {
    const { value } = event.target
    setFormData(prev => ({
      ...prev,
      startTime: value,
      endTime: selectedService ? addMinutes(value, selectedService.duration) : prev.endTime,
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!formData.customerId || !formData.serviceId || !formData.date || !formData.startTime) {
      setError('Preencha cliente, serviço, data e hora de início.')
      return
    }
    if (formData.endTime && formData.endTime <= formData.startTime) {
      setError('A hora de fim deve ser posterior à hora de início.')
      return
    }

    setError('')
    onSubmit({
      ...appointment,
      ...formData,
      customerId: formData.customerId,
      serviceId: formData.serviceId,
      customerName: selectedCustomer?.name ?? '',
      service: selectedService?.name ?? '',
      price: selectedService?.price ?? 0,
      endTime: formData.endTime || addMinutes(formData.startTime, selectedService?.duration ?? 60),
    })
    onClose?.()
  }

  const fieldClass = 'field'

  return (
    <div className="card-surface p-5">
      <h3 className="font-display text-lg font-semibold mb-4">
        {appointment ? 'Editar agendamento' : 'Novo agendamento'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium mb-1.5">
            Cliente
          </label>
          <select
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="">Selecione um cliente</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="serviceId" className="block text-sm font-medium mb-1.5">
            Serviço
          </label>
          <select
            id="serviceId"
            name="serviceId"
            value={formData.serviceId}
            onChange={handleServiceChange}
            className={fieldClass}
          >
            <option value="">Selecione um serviço</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} — {formatCurrency(service.price)} ({service.duration} min)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1.5">
              Data
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium mb-1.5">
              Hora início
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleStartTimeChange}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium mb-1.5">
              Hora fim
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1.5">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
            <option value="no-show">Não compareceu</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1.5">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}

export default AppointmentForm
