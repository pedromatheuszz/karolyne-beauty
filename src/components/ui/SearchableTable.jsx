import { useMemo, useState } from 'react'



/**
 * columns: [{ key, label, render?(item), className?, headerClassName? }]
 */
const SearchableTable = ({
  data = [],
  columns = [],
  title,
  action,
  searchPlaceholder = 'Pesquisar...',
  noDataText = 'Nenhum registro encontrado',
  onSearchChange,
}) => {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortDir, setSortDir] = useState('asc')

  const handleSearch = value => {
    setSearch(value)
    onSearchChange?.(value)
  }

  const handleSort = key => {
    if (sortBy === key) {
      setSortDir(dir => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
  }

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase()

    // Uma linha entra quando QUALQUER coluna contém o termo.
    const filtered = term
      ? data.filter(item =>
          columns.some(column =>
            String(item[column.key] ?? '').toLowerCase().includes(term),
          ),
        )
      : data

    if (!sortBy) return filtered

    const direction = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const valA = a[sortBy]
      const valB = b[sortBy]
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * direction
      }
      return String(valA ?? '').localeCompare(String(valB ?? ''), 'pt-BR') * direction
    })
  }, [data, columns, search, sortBy, sortDir])

  return (
    <div className="card-surface overflow-hidden">
      <div className="p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          <p className="text-xs text-muted-foreground mt-0.5">
            {visibleRows.length} de {data.length} registro(s)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            aria-label={searchPlaceholder}
            className="field w-full sm:w-72"
          />
          {action}
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <p className="empty-state">{noDataText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-y border-border bg-muted/40">
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-5 py-2.5 font-medium text-xs whitespace-nowrap ${
                      column.headerClassName || column.className || ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {column.label}
                      {sortBy === column.key && (
                        <span aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((item, index) => (
                <tr
                  key={item.id ?? index}
                  className="border-b border-border/70 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`px-5 py-3 align-middle ${column.className || ''}`}
                    >
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SearchableTable
