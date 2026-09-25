// Keys are normalized (lowercase, spaces -> dashes) so callers can pass
// 'no-show', 'stock entry' or 'Pago' interchangeably.
const statusStyles = {
  scheduled: 'bg-secondary/12 text-secondary',
  confirmed: 'bg-success/12 text-success',
  completed: 'bg-success/12 text-success',
  cancelled: 'bg-destructive/12 text-destructive',
  'no-show': 'bg-warning/15 text-warning',
  low: 'bg-warning/15 text-warning',
  'out-of-stock': 'bg-destructive/12 text-destructive',
  active: 'bg-success/12 text-success',
  inactive: 'bg-muted-foreground/12 text-muted-foreground',
  expired: 'bg-destructive/12 text-destructive',
  // Estoque
  'stock-entry': 'bg-success/12 text-success',
  'stock-removal': 'bg-destructive/12 text-destructive',
  'manual-adjustment': 'bg-warning/15 text-warning',
  sale: 'bg-secondary/12 text-secondary',
  'product-usage': 'bg-secondary/12 text-secondary',
  // Pagamentos
  pago: 'bg-success/12 text-success',
  pendente: 'bg-warning/15 text-warning',
  'parcialmente-pago': 'bg-secondary/12 text-secondary',
  atrasado: 'bg-destructive/12 text-destructive',
}

const statusLabels = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  'no-show': 'Não compareceu',
  low: 'Estoque baixo',
  'out-of-stock': 'Sem estoque',
  active: 'Ativo',
  inactive: 'Inativo',
  expired: 'Vencido',
  'stock-entry': 'Entrada',
  'stock-removal': 'Saída',
  'manual-adjustment': 'Ajuste',
  sale: 'Venda',
  'product-usage': 'Uso interno',
  pago: 'Pago',
  pendente: 'Pendente',
  'parcialmente-pago': 'Parcialmente pago',
  atrasado: 'Atrasado',
}

const normalize = status => String(status ?? '').trim().toLowerCase().replace(/\s+/g, '-')

const StatusBadge = ({ status, className = '' }) => {
  const key = normalize(status)
  const style = statusStyles[key] || 'bg-muted text-muted-foreground'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style} ${className}`}
    >
      {statusLabels[key] || status}
    </span>
  )
}

export default StatusBadge
