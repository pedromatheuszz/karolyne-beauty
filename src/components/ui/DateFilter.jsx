const DATE_FILTERS = [
  { value: 'today', label: 'Hoje' },
  { value: 'this-week', label: 'Esta semana' },
  { value: 'this-month', label: 'Este mês' },
  { value: 'last-30', label: 'Últimos 30 dias' },
  { value: 'all', label: 'Todo o período' },
]

const DateFilter = ({ onFilterChange, currentFilter }) => {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por período">
      {DATE_FILTERS.map(filter => {
        const isActive = currentFilter === filter.value
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange?.(filter.value)}
            aria-pressed={isActive}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

export default DateFilter
