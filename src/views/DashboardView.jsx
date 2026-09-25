import { useMemo } from 'react'

import DashboardChart from '../components/dashboard/DashboardChart'
import Icon from '../components/ui/Icon'
import KPICard from '../components/ui/KPICard'
import StatusBadge from '../components/ui/StatusBadge'
import { daysUntil, filterByDate } from '../lib/dateFilters'
import { formatCurrency, formatDate, parseISODate } from '../lib/format'
import { whatsappLink } from '../lib/whatsapp'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function isoToday() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10)
}

const DashboardView = ({
  salon,
  customers,
  appointments,
  products,
  payments,
  packages,
  currentFilter,
}) => {
  const scoped = useMemo(
    () => filterByDate(appointments, currentFilter),
    [appointments, currentFilter],
  )

  const metrics = useMemo(() => {
    const completed = scoped.filter(a => a.status === 'completed')
    const revenue = completed.reduce((sum, a) => sum + a.price, 0)
    const upcoming = scoped.filter(a => a.status === 'scheduled' || a.status === 'confirmed')
    const missed = scoped.filter(a => a.status === 'cancelled' || a.status === 'no-show')
    const ticket = completed.length > 0 ? revenue / completed.length : 0
    const receivables = payments
      .filter(p => p.status !== 'pago')
      .reduce((sum, p) => sum + p.amount, 0)

    return { completed, revenue, upcoming, missed, ticket, receivables }
  }, [scoped, payments])

  const today = isoToday()
  const todayAgenda = useMemo(
    () =>
      appointments
        .filter(a => a.date === today && a.status !== 'cancelled')
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments, today],
  )

  const nextAppointments = useMemo(
    () =>
      appointments
        .filter(a => a.date > today && (a.status === 'scheduled' || a.status === 'confirmed'))
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
        .slice(0, 5),
    [appointments, today],
  )

  const alerts = useMemo(() => {
    const lowStock = products.filter(p => p.currentStock <= p.minStockLevel)
    const expiringPackages = packages.filter(p => {
      if (p.status !== 'active') return false
      const days = daysUntil(p.expiresAt)
      return days !== null && days >= 0 && days <= 15
    })
    const overduePayments = payments.filter(p => p.status === 'atrasado')
    return { lowStock, expiringPackages, overduePayments }
  }, [products, packages, payments])

  const revenueByMonth = useMemo(() => {
    const buckets = new Map()
    for (const appointment of appointments.filter(a => a.status === 'completed')) {
      const date = parseISODate(appointment.date)
      if (!date) continue
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth()).padStart(2, '0')}`
      const label = `${MONTHS[date.getUTCMonth()]}/${String(date.getUTCFullYear()).slice(2)}`
      const current = buckets.get(key) || { label, value: 0 }
      current.value += appointment.price
      buckets.set(key, current)
    }
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  }, [appointments])

  const topServices = useMemo(() => {
    const buckets = new Map()
    for (const appointment of appointments) {
      if (appointment.status === 'cancelled' || appointment.status === 'no-show') continue
      buckets.set(appointment.service, (buckets.get(appointment.service) || 0) + 1)
    }
    return [...buckets.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [appointments])

  const activePackages = packages.filter(p => p.status === 'active')

  return (
    <div className="space-y-6">
      {/* Saudação da marca */}
      <div className="card-surface p-6 md:p-7 relative overflow-hidden">
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-accent-soft/35 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="brand-caps text-[10px] text-accent mb-2">{salon.city}</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold">
            Olá, {salon.nickname}
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            {todayAgenda.length > 0
              ? `Você tem ${todayAgenda.length} atendimento(s) hoje — o primeiro às ${todayAgenda[0].startTime}.`
              : 'Nenhum atendimento marcado para hoje. Bom momento para organizar o estoque ou retomar clientes.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Receita no período"
          value={metrics.revenue}
          currency
          icon="trending"
          tone="accent"
        />
        <KPICard title="Ticket médio" value={metrics.ticket} currency icon="card" tone="secondary" />
        <KPICard
          title="Atendimentos realizados"
          value={metrics.completed.length}
          icon="sparkle"
          tone="success"
        />
        <KPICard
          title="Sessões agendadas"
          value={metrics.upcoming.length}
          icon="calendar"
          tone="default"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Clientes ativas" value={customers.length} icon="users" />
        <KPICard
          title="Pacotes em andamento"
          value={activePackages.length}
          icon="ticket"
          tone="accent"
          subtitle={`${activePackages.reduce((s, p) => s + (p.totalSessions - p.usedSessions), 0)} sessões a entregar`}
        />
        <KPICard
          title="Faltas e cancelamentos"
          value={metrics.missed.length}
          icon="alert"
          tone={metrics.missed.length > 0 ? 'warning' : 'default'}
          subtitle={
            scoped.length > 0
              ? `${((metrics.missed.length / scoped.length) * 100).toFixed(0)}% da agenda do período`
              : 'Sem agendamentos no período'
          }
        />
        <KPICard
          title="A receber"
          value={metrics.receivables}
          currency
          icon="clock"
          tone={metrics.receivables > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Agenda de hoje */}
        <div className="card-surface p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-display text-lg font-semibold">Agenda de hoje</h3>
            <span className="text-xs text-muted-foreground">{formatDate(today)}</span>
          </div>

          {todayAgenda.length === 0 ? (
            <p className="empty-state">Nenhum atendimento marcado para hoje</p>
          ) : (
            <ul className="space-y-2">
              {todayAgenda.map(appointment => {
                const customer = customers.find(c => c.id === appointment.customerId)
                const link = whatsappLink(
                  customer?.phone,
                  `Oi, ${appointment.customerName.split(' ')[0]}! Passando para confirmar seu horário de ${appointment.service} hoje às ${appointment.startTime}. 💆‍♀️`,
                )
                return (
                  <li
                    key={appointment.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <span className="font-display text-lg font-semibold w-14 shrink-0 real">
                      {appointment.startTime}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium truncate">{appointment.customerName}</span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {appointment.service} · até {appointment.endTime}
                      </span>
                    </span>
                    <StatusBadge status={appointment.status} />
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        title={`Confirmar com ${appointment.customerName} pelo WhatsApp`}
                        className="p-2 rounded-lg text-success hover:bg-success/10 transition-colors"
                      >
                        <Icon name="whatsapp" className="w-[18px] h-[18px]" />
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Alertas */}
        <div className="card-surface p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Precisa de atenção</h3>
          <ul className="space-y-3 text-sm">
            <AlertRow
              icon="ticket"
              tone="warning"
              show={alerts.expiringPackages.length > 0}
              title={`${alerts.expiringPackages.length} pacote(s) vencendo em até 15 dias`}
              detail={alerts.expiringPackages.map(p => p.customerName).join(', ')}
            />
            <AlertRow
              icon="card"
              tone="destructive"
              show={alerts.overduePayments.length > 0}
              title={`${alerts.overduePayments.length} pagamento(s) em atraso`}
              detail={formatCurrency(
                alerts.overduePayments.reduce((sum, p) => sum + p.amount, 0),
              )}
            />
            <AlertRow
              icon="box"
              tone="warning"
              show={alerts.lowStock.length > 0}
              title={`${alerts.lowStock.length} produto(s) para repor`}
              detail={alerts.lowStock.map(p => p.name).join(', ')}
            />
            {alerts.expiringPackages.length === 0 &&
              alerts.overduePayments.length === 0 &&
              alerts.lowStock.length === 0 && (
                <li className="text-muted-foreground py-6 text-center">
                  Tudo em dia por aqui ✨
                </li>
              )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardChart
          title="Receita por mês"
          subtitle="Atendimentos concluídos"
          data={revenueByMonth}
          valueFormatter={formatCurrency}
        />
        <DashboardChart
          title="Serviços mais procurados"
          subtitle="Número de sessões"
          data={topServices}
          tone="secondary"
        />
      </div>

      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Próximos atendimentos</h3>
        {nextAppointments.length === 0 ? (
          <p className="empty-state">Nenhuma sessão agendada à frente</p>
        ) : (
          <ul className="divide-y divide-border">
            {nextAppointments.map(appointment => (
              <li key={appointment.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{appointment.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {appointment.service} · {formatDate(appointment.date)} às {appointment.startTime}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="real text-sm">{formatCurrency(appointment.price)}</span>
                  <StatusBadge status={appointment.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const TONE_CLASSES = {
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/12 text-destructive',
}

const AlertRow = ({ show, icon, tone, title, detail }) => {
  if (!show) return null
  return (
    <li className="flex gap-3">
      <span className={`shrink-0 grid place-items-center w-8 h-8 rounded-xl ${TONE_CLASSES[tone]}`}>
        <Icon name={icon} className="w-4 h-4" />
      </span>
      <span className="min-w-0">
        <span className="block font-medium">{title}</span>
        {detail && <span className="block text-xs text-muted-foreground">{detail}</span>}
      </span>
    </li>
  )
}

export default DashboardView
