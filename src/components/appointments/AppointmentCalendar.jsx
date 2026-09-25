import { useMemo, useState } from 'react'

import StatusBadge from '../ui/StatusBadge'
import { formatCurrency, formatDate, parseISODate } from '../../lib/format'

const VIEWS = [
  { id: 'day', label: 'Dia' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
]

const DAY = 24 * 60 * 60 * 1000

function horizonFor(view) {
  if (view === 'day') return 1
  if (view === 'week') return 7
  return 31
}

const AppointmentCalendar = ({ appointments = [], referenceDate }) => {
  const [view, setView] = useState('week')

  // Anchors on today, falling back to the nearest appointment (upcoming first,
  // otherwise the most recent one) so the agenda is never pointlessly empty.
  const anchor = useMemo(() => {
    if (referenceDate) return parseISODate(referenceDate)

    const now = new Date()
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    const dates = appointments
      .map(a => parseISODate(a.date))
      .filter(Boolean)
      .sort((a, b) => a - b)

    if (dates.length === 0) return today
    if (dates.some(date => date >= today)) return today
    return dates.at(-1)
  }, [appointments, referenceDate])

  const visible = useMemo(() => {
    const end = new Date(anchor.getTime() + (horizonFor(view) - 1) * DAY)
    return appointments
      .filter(appointment => {
        const date = parseISODate(appointment.date)
        return date && date >= anchor && date <= end
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
  }, [appointments, anchor, view])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const appointment of visible) {
      const list = map.get(appointment.date) || []
      list.push(appointment)
      map.set(appointment.date, list)
    }
    return [...map.entries()]
  }, [visible])

  const total = visible.reduce((sum, appointment) => sum + appointment.price, 0)

  return (
    <div className="card-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-display text-lg font-semibold">Agenda</h3>
        <div className="flex gap-1" role="group" aria-label="Período da agenda">
          {VIEWS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-pressed={view === item.id}
              className={`px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                view === item.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        A partir de {formatDate(anchor.toISOString().slice(0, 10))} · {visible.length} atendimento(s)
        · <span className="real">{formatCurrency(total)}</span>
      </p>

      {grouped.length === 0 ? (
        <p className="empty-state">Nenhum atendimento neste período</p>
      ) : (
        <div className="space-y-3">
          {grouped.map(([date, items]) => (
            <div key={date} className="rounded-xl border border-border p-4">
              <h4 className="font-medium mb-2 text-sm">{formatDate(date)}</h4>
              <ul className="space-y-2 text-sm">
                {items.map(appointment => (
                  <li key={appointment.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-muted-foreground">
                      {appointment.startTime}–{appointment.endTime} · {appointment.customerName} ·{' '}
                      {appointment.service}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="real">{formatCurrency(appointment.price)}</span>
                      <StatusBadge status={appointment.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AppointmentCalendar
