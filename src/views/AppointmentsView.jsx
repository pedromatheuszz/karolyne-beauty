import { useMemo, useState } from 'react'

import AppointmentCalendar from '../components/appointments/AppointmentCalendar'
import AppointmentForm from '../components/appointments/AppointmentForm'
import Icon from '../components/ui/Icon'
import SearchableTable from '../components/ui/SearchableTable'
import StatusBadge from '../components/ui/StatusBadge'
import { filterByDate } from '../lib/dateFilters'
import { formatCurrency, formatDate } from '../lib/format'
import { whatsappLink } from '../lib/whatsapp'

const AppointmentsView = ({
  appointments,
  customers,
  services,
  currentFilter,
  onSaveAppointment,
}) => {
  const [editing, setEditing] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const scoped = useMemo(
    () => filterByDate(appointments, currentFilter),
    [appointments, currentFilter],
  )

  const columns = useMemo(
    () => [
      {
        key: 'date',
        label: 'Quando',
        render: item => (
          <span>
            <span className="block font-medium">{formatDate(item.date)}</span>
            <span className="block text-xs text-muted-foreground real">
              {item.startTime}–{item.endTime}
            </span>
          </span>
        ),
      },
      {
        key: 'customerName',
        label: 'Cliente',
        render: item => {
          const customer = customers.find(c => c.id === item.customerId)
          const link = whatsappLink(
            customer?.phone,
            `Oi, ${item.customerName.split(' ')[0]}! Confirmando seu horário de ${item.service} em ${formatDate(item.date)} às ${item.startTime}. 💆‍♀️`,
          )
          return (
            <span className="flex items-center gap-1.5">
              <span className="font-medium">{item.customerName}</span>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  title="Confirmar pelo WhatsApp"
                  className="p-1 rounded text-success hover:bg-success/10 transition-colors"
                >
                  <Icon name="whatsapp" className="w-4 h-4" />
                </a>
              )}
            </span>
          )
        },
      },
      { key: 'service', label: 'Serviço' },
      {
        key: 'price',
        label: 'Valor',
        className: 'text-right real',
        render: item => formatCurrency(item.price),
      },
      { key: 'status', label: 'Status', render: item => <StatusBadge status={item.status} /> },
      {
        key: 'id',
        label: 'Ações',
        render: item => (
          <button
            type="button"
            onClick={() => {
              setEditing(item)
              setIsFormOpen(true)
            }}
            className="text-accent text-sm font-medium hover:underline"
          >
            Editar
          </button>
        ),
      },
    ],
    [customers],
  )

  const handleClose = () => {
    setIsFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      {isFormOpen && (
        <AppointmentForm
          appointment={editing}
          customers={customers}
          services={services}
          onSubmit={onSaveAppointment}
          onClose={handleClose}
        />
      )}

      <AppointmentCalendar appointments={appointments} />

      <SearchableTable
        title="Todos os atendimentos"
        data={scoped}
        columns={columns}
        searchPlaceholder="Buscar por cliente, serviço ou status..."
        noDataText="Nenhum atendimento no período selecionado"
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setIsFormOpen(true)
            }}
            className="btn-primary whitespace-nowrap"
          >
            <Icon name="plus" className="w-4 h-4" />
            Novo
          </button>
        }
      />
    </div>
  )
}

export default AppointmentsView
