import { useMemo, useState } from 'react'

import { filterByDate } from '../../lib/dateFilters'
import { formatCurrency } from '../../lib/format'

function toCSV(rows) {
  const escape = value => `"${String(value).replace(/"/g, '""')}"`
  return rows.map(row => row.map(escape).join(';')).join('\r\n')
}

function downloadCSV(filename, rows) {
  // The UTF-8 BOM makes Excel pt-BR open the accented columns correctly.
  const BOM = String.fromCharCode(0xfeff)
  const blob = new Blob([BOM + toCSV(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const ReportsSection = ({
  appointments = [],
  customers = [],
  products = [],
  payments = [],
  packages = [],
  currentFilter,
}) => {
  const [expanded, setExpanded] = useState('financial')

  const scoped = useMemo(
    () => filterByDate(appointments, currentFilter),
    [appointments, currentFilter],
  )

  const reports = useMemo(() => {
    const completed = scoped.filter(a => a.status === 'completed')
    const revenue = completed.reduce((sum, a) => sum + a.price, 0)

    const byService = new Map()
    for (const appointment of completed) {
      byService.set(appointment.service, (byService.get(appointment.service) || 0) + appointment.price)
    }

    const byMethod = new Map()
    for (const payment of payments.filter(p => p.status === 'pago')) {
      byMethod.set(payment.method, (byMethod.get(payment.method) || 0) + payment.amount)
    }

    const byStatus = new Map()
    for (const appointment of scoped) {
      byStatus.set(appointment.status, (byStatus.get(appointment.status) || 0) + 1)
    }

    const byCustomer = new Map()
    for (const appointment of completed) {
      byCustomer.set(
        appointment.customerName,
        (byCustomer.get(appointment.customerName) || 0) + appointment.price,
      )
    }

    const activePackages = packages.filter(p => p.status === 'active')
    const sessionsToDeliver = activePackages.reduce(
      (sum, p) => sum + (p.totalSessions - p.usedSessions),
      0,
    )
    const deferredRevenue = activePackages.reduce((sum, p) => {
      const unit = p.totalSessions > 0 ? p.price / p.totalSessions : 0
      return sum + unit * (p.totalSessions - p.usedSessions)
    }, 0)

    const inventoryValue = products.reduce((sum, p) => sum + p.costPrice * p.currentStock, 0)
    const lowStock = products.filter(p => p.currentStock <= p.minStockLevel)
    const receivables = payments
      .filter(p => p.status !== 'pago')
      .reduce((sum, p) => sum + p.amount, 0)

    return {
      financial: {
        title: 'Financeiro',
        rows: [
          ['Receita no período', formatCurrency(revenue)],
          ['Atendimentos concluídos', String(completed.length)],
          [
            'Ticket médio',
            formatCurrency(completed.length > 0 ? revenue / completed.length : 0),
          ],
          ['Recebíveis em aberto', formatCurrency(receivables)],
          ...[...byMethod.entries()].map(([method, total]) => [
            `Recebido via ${method}`,
            formatCurrency(total),
          ]),
        ],
      },
      appointments: {
        title: 'Agendamentos',
        rows: [
          ['Total no período', String(scoped.length)],
          ...[...byStatus.entries()].map(([status, count]) => [`Status: ${status}`, String(count)]),
          ...[...byService.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([service, total]) => [`Receita — ${service}`, formatCurrency(total)]),
        ],
      },
      customers: {
        title: 'Clientes',
        rows: [
          ['Clientes cadastrados', String(customers.length)],
          [
            'Clientes atendidos no período',
            String(new Set(completed.map(a => a.customerId)).size),
          ],
          ...[...byCustomer.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, total]) => [`Top cliente — ${name}`, formatCurrency(total)]),
        ],
      },
      packages: {
        title: 'Pacotes',
        rows: [
          ['Pacotes ativos', String(activePackages.length)],
          ['Sessões a entregar', String(sessionsToDeliver)],
          ['Receita a realizar', formatCurrency(deferredRevenue)],
          ['Pacotes concluídos', String(packages.filter(p => p.status === 'completed').length)],
          ['Pacotes vencidos', String(packages.filter(p => p.status === 'expired').length)],
          ...activePackages.map(p => [
            `${p.customerName} — ${p.serviceName}`,
            `${p.usedSessions}/${p.totalSessions} sessões`,
          ]),
        ],
      },
      inventory: {
        title: 'Inventário',
        rows: [
          ['Produtos cadastrados', String(products.length)],
          ['Valor do inventário (custo)', formatCurrency(inventoryValue)],
          ['Produtos em alerta', String(lowStock.length)],
          ...lowStock.map(p => [`Alerta — ${p.name}`, `${p.currentStock} ${p.unit}`]),
        ],
      },
    }
  }, [scoped, customers, products, payments, packages])

  const handleExport = key => {
    const report = reports[key]
    downloadCSV(`relatorio-${key}.csv`, [['Indicador', 'Valor'], ...report.rows])
  }

  return (
    <div className="space-y-4">
      {Object.entries(reports).map(([key, report]) => {
        const isOpen = expanded === key
        return (
          <div key={key} className="card-surface">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? '' : key)}
                aria-expanded={isOpen}
                className="flex-1 text-left font-display text-lg font-semibold"
              >
                {report.title}
              </button>
              <button
                type="button"
                onClick={() => handleExport(key)}
                className="btn-ghost text-[13px] py-1.5"
              >
                Exportar CSV
              </button>
            </div>

            {isOpen && (
              <ul className="px-5 pb-5 divide-y divide-border text-sm">
                {report.rows.map(([label, value]) => (
                  <li key={label} className="py-2 flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium real">{value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ReportsSection
