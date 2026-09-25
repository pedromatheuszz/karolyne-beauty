import { useMemo } from 'react'

import StatusBadge from '../ui/StatusBadge'
import { formatDate } from '../../lib/format'

const InventoryTransactions = ({ transactions = [] }) => {
  const summary = useMemo(() => {
    let entries = 0
    let exits = 0
    let adjustments = 0

    for (const transaction of transactions) {
      const quantity = Number(transaction.quantity) || 0
      if (transaction.type === 'manual adjustment') adjustments += quantity
      else if (quantity >= 0) entries += quantity
      else exits += quantity
    }

    return { entries, exits, adjustments }
  }, [transactions])

  const ordered = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  )

  return (
    <div className="card-surface p-5">
      <h3 className="font-display text-lg font-semibold mb-4">Movimentação de estoque</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium">Entradas</p>
          <p className="text-2xl font-bold text-success real">+{summary.entries}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium">Saídas</p>
          <p className="text-2xl font-bold text-destructive real">{summary.exits}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium">Ajustes</p>
          <p className="text-2xl font-bold text-warning real">
            {summary.adjustments > 0 ? '+' : ''}
            {summary.adjustments}
          </p>
        </div>
      </div>

      {ordered.length === 0 ? (
        <p className="empty-state">Nenhuma movimentação registrada</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 font-medium text-xs">Data</th>
                <th className="px-4 py-2.5 font-medium text-xs">Produto</th>
                <th className="px-4 py-2.5 font-medium text-xs">Tipo</th>
                <th className="px-4 py-2.5 font-medium text-xs text-right">Quantidade</th>
                <th className="px-4 py-2.5 font-medium text-xs">Motivo</th>
                <th className="px-4 py-2.5 font-medium text-xs">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map(transaction => (
                <tr key={transaction.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">{formatDate(transaction.date)}</td>
                  <td className="px-4 py-2.5 font-medium text-xs">{transaction.product}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={transaction.type} />
                  </td>
                  <td
                    className={`px-3 py-2 text-right real ${
                      transaction.quantity < 0 ? 'text-destructive' : 'text-success'
                    }`}
                  >
                    {transaction.quantity > 0 ? '+' : ''}
                    {transaction.quantity}
                  </td>
                  <td className="px-4 py-3">{transaction.reason}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{transaction.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default InventoryTransactions
