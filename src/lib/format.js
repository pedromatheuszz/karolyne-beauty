const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function formatCurrency(value) {
  const number = Number(value)
  return currencyFormatter.format(Number.isFinite(number) ? number : 0)
}

/**
 * Formats an ISO date ('2025-01-15'). Parsed as UTC so the date never shifts
 * a day backwards for users in negative-offset timezones (e.g. America/Sao_Paulo).
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(`${isoDate}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

/** Midnight-UTC Date for an ISO date string, for safe comparisons. */
export function parseISODate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}
