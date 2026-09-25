import { useMemo, useState } from 'react'

import PackageCard from '../components/packages/PackageCard'
import PackageForm from '../components/packages/PackageForm'
import Icon from '../components/ui/Icon'
import KPICard from '../components/ui/KPICard'
import { daysUntil } from '../lib/dateFilters'

const FILTERS = [
  { id: 'active', label: 'Ativos' },
  { id: 'expiring', label: 'A vencer' },
  { id: 'completed', label: 'Concluídos' },
  { id: 'expired', label: 'Vencidos' },
  { id: 'all', label: 'Todos' },
]

const PackagesView = ({ packages, customers, services, onSavePackage, onUseSession }) => {
  const [filter, setFilter] = useState('active')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const metrics = useMemo(() => {
    const active = packages.filter(p => p.status === 'active')
    const remainingSessions = active.reduce(
      (sum, p) => sum + (p.totalSessions - p.usedSessions),
      0,
    )
    // Receita já recebida cujo serviço ainda não foi entregue.
    const deferredRevenue = active.reduce((sum, p) => {
      const unit = p.totalSessions > 0 ? p.price / p.totalSessions : 0
      return sum + unit * (p.totalSessions - p.usedSessions)
    }, 0)
    const expiring = active.filter(p => {
      const days = daysUntil(p.expiresAt)
      return days !== null && days >= 0 && days <= 15
    })

    return { active, remainingSessions, deferredRevenue, expiring }
  }, [packages])

  const visible = useMemo(() => {
    const byFilter = {
      active: p => p.status === 'active',
      completed: p => p.status === 'completed',
      expired: p => p.status === 'expired',
      expiring: p => metrics.expiring.includes(p),
      all: () => true,
    }
    return packages.filter(byFilter[filter] ?? (() => true))
  }, [packages, filter, metrics.expiring])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Pacotes ativos"
          value={metrics.active.length}
          icon="ticket"
          tone="accent"
        />
        <KPICard
          title="Sessões a entregar"
          value={metrics.remainingSessions}
          icon="clock"
          tone="secondary"
          subtitle="Já pagas e ainda não realizadas"
        />
        <KPICard
          title="Receita a realizar"
          value={metrics.deferredRevenue}
          currency
          icon="card"
          tone="success"
          subtitle="Valor recebido que ainda é serviço a prestar"
        />
        <KPICard
          title="Vencendo em 15 dias"
          value={metrics.expiring.length}
          icon="alert"
          tone={metrics.expiring.length > 0 ? 'warning' : 'default'}
          subtitle={
            metrics.expiring.length > 0
              ? metrics.expiring.map(p => p.customerName).join(', ')
              : 'Nenhum pacote perto do vencimento'
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === item.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setIsFormOpen(true)} className="btn-primary">
          <Icon name="plus" className="w-4 h-4" />
          Novo pacote
        </button>
      </div>

      {isFormOpen && (
        <PackageForm
          customers={customers}
          services={services}
          onSubmit={onSavePackage}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {visible.length === 0 ? (
        <div className="card-surface">
          <p className="empty-state">Nenhum pacote nesta situação</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} onUseSession={onUseSession} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PackagesView
