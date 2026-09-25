import Icon from './Icon'
import { formatCurrency } from '../../lib/format'

const TONES = {
  default: 'bg-muted text-muted-foreground',
  accent: 'bg-accent/12 text-accent',
  secondary: 'bg-secondary/12 text-secondary',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/12 text-destructive',
}

const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  tone = 'default',
  currency = false,
  className = '',
}) => {
  return (
    <div className={`card-surface p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">{title}</p>
        {icon && (
          <span className={`shrink-0 grid place-items-center w-8 h-8 rounded-xl ${TONES[tone]}`}>
            <Icon name={icon} className="w-4 h-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[26px] leading-tight font-semibold real">
        {currency ? formatCurrency(value) : value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

export default KPICard
