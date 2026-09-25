import { useMemo, useState } from 'react'

import CustomerForm from '../components/customers/CustomerForm'
import CustomerProfile from '../components/customers/CustomerProfile'
import Icon from '../components/ui/Icon'
import SearchableTable from '../components/ui/SearchableTable'
import { formatCurrency, formatDate } from '../lib/format'
import { whatsappLink } from '../lib/whatsapp'

const CustomersView = ({ customers, appointments, payments, packages, onSaveCustomer }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const rows = useMemo(
    () =>
      customers.map(customer => {
        const history = appointments.filter(a => a.customerId === customer.id)
        const completed = history.filter(a => a.status === 'completed')
        const last = completed.map(a => a.date).sort((a, b) => b.localeCompare(a))[0]
        const activePackages = packages.filter(
          p => p.customerId === customer.id && p.status === 'active',
        )

        return {
          ...customer,
          sessionCount: completed.length,
          spent: completed.reduce((sum, a) => sum + a.price, 0),
          lastAppointment: last ?? '',
          activeSessions: activePackages.reduce(
            (sum, p) => sum + (p.totalSessions - p.usedSessions),
            0,
          ),
        }
      }),
    [customers, appointments, packages],
  )

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Cliente',
        render: item => (
          <button type="button" onClick={() => setSelectedCustomerId(item.id)} className="text-left">
            <span className="font-medium text-accent hover:underline">{item.name}</span>
            <span className="block text-xs text-muted-foreground">{item.phone}</span>
          </button>
        ),
      },
      { key: 'sessionCount', label: 'Sessões', className: 'text-right real' },
      {
        key: 'activeSessions',
        label: 'Saldo em pacote',
        className: 'text-right real',
        render: item =>
          item.activeSessions > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-accent font-medium">
              <Icon name="ticket" className="w-3.5 h-3.5" />
              {item.activeSessions}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: 'spent',
        label: 'Total investido',
        className: 'text-right real',
        render: item => formatCurrency(item.spent),
      },
      {
        key: 'outstandingBalance',
        label: 'Em aberto',
        className: 'text-right real',
        render: item => (
          <span className={item.outstandingBalance > 0 ? 'text-destructive' : 'text-success'}>
            {formatCurrency(item.outstandingBalance)}
          </span>
        ),
      },
      {
        key: 'lastAppointment',
        label: 'Último atendimento',
        render: item => (item.lastAppointment ? formatDate(item.lastAppointment) : '—'),
      },
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
      {
        key: 'email',
        label: 'Contato',
        render: item => {
          const link = whatsappLink(
            item.phone,
            `Oi, ${item.name.split(' ')[0]}! Aqui é a Karol 💆‍♀️`,
          )
          return link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              title={`Conversar com ${item.name} no WhatsApp`}
              className="inline-flex p-2 rounded-lg text-success hover:bg-success/10 transition-colors"
            >
              <Icon name="whatsapp" className="w-[18px] h-[18px]" />
            </a>
          ) : null
        },
      },
    ],
    [],
  )

  if (selectedCustomerId !== null) {
    return (
      <CustomerProfile
        customerId={selectedCustomerId}
        customers={customers}
        appointments={appointments}
        payments={payments}
        packages={packages}
        onBack={() => setSelectedCustomerId(null)}
      />
    )
  }

  const handleClose = () => {
    setIsFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      {isFormOpen && (
        <CustomerForm
          customer={editing}
          onSubmit={onSaveCustomer}
          onClose={handleClose}
        />
      )}

      <SearchableTable
        title="Clientes"
        data={rows}
        columns={columns}
        searchPlaceholder="Buscar por nome, telefone ou e-mail..."
        noDataText="Nenhuma cliente cadastrada ainda — comece pelo botão Nova."
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
            Nova
          </button>
        }
      />
    </div>
  )
}

export default CustomersView
