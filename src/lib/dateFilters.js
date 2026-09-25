import { parseISODate } from './format'

/** Start of today, at midnight UTC, so it lines up with parseISODate. */
function todayUTC() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

const DAY = 24 * 60 * 60 * 1000

/**
 * Returns [start, end] as inclusive midnight-UTC bounds, or null for 'all'.
 */
export function getDateRange(filter) {
  const today = todayUTC()

  switch (filter) {
    case 'today':
      return [today, today]
    case 'this-week': {
      // Week starts on Sunday, matching the pt-BR calendar convention.
      const start = new Date(today.getTime() - today.getUTCDay() * DAY)
      return [start, new Date(start.getTime() + 6 * DAY)]
    }
    case 'this-month': {
      const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0))
      return [start, end]
    }
    case 'last-30':
      return [new Date(today.getTime() - 29 * DAY), today]
    case 'all':
    default:
      return null
  }
}

/** Filters records with an ISO `date` field down to the selected period. */
export function filterByDate(records, filter, dateKey = 'date') {
  const range = getDateRange(filter)
  if (!range) return records

  const [start, end] = range
  return records.filter(record => {
    const date = parseISODate(record[dateKey])
    return date !== null && date >= start && date <= end
  })
}

/** Dias até uma data ISO (negativo quando já passou). */
export function daysUntil(isoDate) {
  const target = parseISODate(isoDate)
  if (!target) return null
  return Math.round((target.getTime() - todayUTC().getTime()) / DAY)
}
