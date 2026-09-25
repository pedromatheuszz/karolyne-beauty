import Icon from '../ui/Icon'
import StatusBadge from '../ui/StatusBadge'
import { daysUntil } from '../../lib/dateFilters'
import { formatCurrency, formatDate } from '../../lib/format'

const PackageCard = ({ pkg, onUseSession }) => {
  const remaining = pkg.totalSessions - pkg.usedSessions
  const progress = pkg.totalSessions > 0 ? (pkg.usedSessions / pkg.totalSessions) * 100 : 0
  const days = daysUntil(pkg.expiresAt)
  const isActive = pkg.status === 'active'
  const expiringSoon = isActive && days !== null && days >= 0 && days <= 15

  return (
    <div className="card-surface p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{pkg.customerName}</p>
          <p className="text-[13px] text-muted-foreground truncate">{pkg.serviceName}</p>
        </div>
        <StatusBadge status={pkg.status} />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-semibold real">{remaining}</span>
            <span className="text-[13px] text-muted-foreground">
              {remaining === 0
                ? 'pacote concluído'
                : `de ${pkg.totalSessions} sessões a realizar`}
            </span>
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {pkg.usedSessions} já feitas
          </span>
        </div>

        <div
          className="h-2 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={pkg.usedSessions}
          aria-valuemin={0}
          aria-valuemax={pkg.totalSessions}
          aria-label={`${pkg.usedSessions} de ${pkg.totalSessions} sessões usadas`}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${
              remaining === 0 ? 'bg-success' : 'bg-accent'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-[13px]">
        <div>
          <dt className="text-muted-foreground">Valor pago</dt>
          <dd className="font-medium real">{formatCurrency(pkg.price)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Valor por sessão</dt>
          <dd className="font-medium real">
            {formatCurrency(pkg.totalSessions > 0 ? pkg.price / pkg.totalSessions : 0)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Validade</dt>
          <dd
            className={`font-medium flex items-center gap-1.5 ${
              days !== null && days < 0
                ? 'text-destructive'
                : expiringSoon
                  ? 'text-warning'
                  : ''
            }`}
          >
            {(expiringSoon || (days !== null && days < 0)) && (
              <Icon name="clock" className="w-3.5 h-3.5" />
            )}
            {formatDate(pkg.expiresAt)}
            {days !== null && (
              <span className="text-xs font-normal text-muted-foreground">
                {days < 0 ? `(venceu há ${Math.abs(days)}d)` : `(em ${days}d)`}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => onUseSession?.(pkg.id)}
        disabled={!isActive || remaining === 0}
        className="btn-ghost w-full disabled:opacity-45 disabled:cursor-not-allowed"
      >
        <Icon name="plus" className="w-4 h-4" />
        Registrar sessão realizada
      </button>
    </div>
  )
}

export default PackageCard
