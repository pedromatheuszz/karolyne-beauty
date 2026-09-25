import { useMemo } from 'react'

import Icon from '../ui/Icon'
import StatusBadge from '../ui/StatusBadge'
import { formatCurrency, formatDate } from '../../lib/format'
import { whatsappLink } from '../../lib/whatsapp'

const CustomerProfile = ({
  customerId,
  customers = [],
  appointments = [],
  payments = [],
  packages = [],
  onBack,
}) => {
  const customer = customers.find(c => c.id === customerId)

  const history = useMemo(
    () =>
      appointments
        .filter(a => a.customerId === customerId)
        // Copia antes de ordenar: sort() muta e este array vem de props.
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date)),
    [appointments, customerId],
  )

  const customerPayments = useMemo(
    () =>
      payments
        .filter(p => p.customerId === customerId)
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date)),
    [payments, customerId],
  )

  const customerPackages = useMemo(
    () => packages.filter(p => p.customerId === customerId),
    [packages, customerId],
  )

  if (!customer) {
    return (
      <div className="card-surface p-5">
        <p className="text-muted-foreground">Cliente não encontrada.</p>
      </div>
    )
  }

  const completed = history.filter(a => a.status === 'completed')
  const totalSpent = completed.reduce((sum, a) => sum + a.price, 0)
  const lastAppointment = completed[0] || history[0]
  const link = whatsappLink(customer.phone, `Oi, ${customer.name.split(' ')[0]}! Aqui é a Karol 💆‍♀️`)

  const info = [
    ['Telefone', customer.phone],
    ['E-mail', customer.email],
    ['Nascimento', formatDate(customer.birthDate)],
    ['Endereço', customer.address],
    ['Cliente desde', formatDate(customer.registrationDate)],
  ]

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="card-surface p-6">
        <div className="flex flex-wrap items-start gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
              aria-label="Voltar para a lista de clientes"
            >
              <Icon name="back" className="w-4 h-4" />
            </button>
          )}

          <div className="w-14 h-14 shrink-0 rounded-2xl bg-accent/12 text-accent grid place-items-center font-display text-xl font-semibold">
            {customer.name
              .split(' ')
              .slice(0, 2)
              .map(part => part[0])
              .join('')}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold truncate">{customer.name}</h2>
            {customer.notes && (
              <p className="text-sm text-muted-foreground mt-0.5">{customer.notes}</p>
            )}
          </div>

          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="btn-primary">
              <Icon name="whatsapp" className="w-4 h-4" />
              WhatsApp
            </a>
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {info.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
              <dd className="text-sm font-medium break-words">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Números */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Sessões realizadas" value={completed.length} />
        <Stat label="Total investido" value={formatCurrency(totalSpent)} />
        <Stat
          label="Em aberto"
          value={formatCurrency(customer.outstandingBalance)}
          tone={customer.outstandingBalance > 0 ? 'text-destructive' : 'text-success'}
        />
        <Stat
          label="Último atendimento"
          value={lastAppointment ? formatDate(lastAppointment.date) : '—'}
        />
      </div>

      {/* Pacotes */}
      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Pacotes</h3>
        {customerPackages.length === 0 ? (
          <p className="empty-state">Nenhum pacote contratado</p>
        ) : (
          <ul className="space-y-2">
            {customerPackages.map(pkg => {
              const remaining = pkg.totalSessions - pkg.usedSessions
              const progress = (pkg.usedSessions / pkg.totalSessions) * 100
              return (
                <li key={pkg.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-medium">{pkg.serviceName}</span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="real">
                        {pkg.usedSessions}/{pkg.totalSessions} sessões
                      </span>
                      <StatusBadge status={pkg.status} />
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${remaining === 0 ? 'bg-success' : 'bg-accent'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatCurrency(pkg.price)} · válido até {formatDate(pkg.expiresAt)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Histórico de atendimentos</h3>
          {history.length === 0 ? (
            <p className="empty-state">Nenhum atendimento registrado</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {history.map(appointment => (
                <li
                  key={appointment.id}
                  className="px-4 py-2.5 rounded-xl border border-border flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="min-w-0">
                    <span className="block font-medium truncate">{appointment.service}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDate(appointment.date)} às {appointment.startTime}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="real">{formatCurrency(appointment.price)}</span>
                    <StatusBadge status={appointment.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-surface p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Histórico de pagamentos</h3>
          {customerPayments.length === 0 ? (
            <p className="empty-state">Nenhum pagamento registrado</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {customerPayments.map(payment => (
                <li
                  key={payment.id}
                  className="px-4 py-2.5 rounded-xl border border-border flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="min-w-0">
                    <span className="block font-medium truncate">
                      {payment.reference || payment.method}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDate(payment.date)} · {payment.method}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="real">{formatCurrency(payment.amount)}</span>
                    <StatusBadge status={payment.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

const Stat = ({ label, value, tone = '' }) => (
  <div className="card-surface p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`font-display text-xl font-semibold real ${tone}`}>{value}</p>
  </div>
)

export default CustomerProfile
