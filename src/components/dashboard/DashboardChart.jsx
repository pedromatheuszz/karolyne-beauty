/**
 * Gráfico de barras leve. `data` é [{ label, value }].
 * Feito com divs para o projeto não carregar nenhuma lib de gráfico.
 */
const DashboardChart = ({
  title,
  subtitle,
  data = [],
  height = 200,
  tone = 'accent',
  valueFormatter = v => v,
}) => {
  const max = data.reduce((acc, item) => Math.max(acc, Number(item.value) || 0), 0)
  const barColor = tone === 'secondary' ? 'bg-secondary' : 'bg-accent'

  return (
    <div className="card-surface p-5">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      {data.length === 0 ? (
        <div
          className="flex items-center justify-center text-sm text-muted-foreground"
          style={{ height }}
        >
          Sem dados no período
        </div>
      ) : (
        <div className="flex items-end gap-2.5" style={{ height }}>
          {data.map(item => {
            const value = Number(item.value) || 0
            const pct = max > 0 ? (value / max) * 100 : 0
            return (
              <div
                key={item.label}
                className="flex-1 min-w-0 flex flex-col items-center justify-end h-full gap-1.5"
              >
                <span className="text-[10px] text-muted-foreground real whitespace-nowrap">
                  {valueFormatter(value)}
                </span>
                <div
                  className={`w-full rounded-t-lg ${barColor} opacity-85 hover:opacity-100 transition-[opacity,height] duration-300 min-h-[3px]`}
                  style={{ height: `${pct}%` }}
                  title={`${item.label}: ${valueFormatter(value)}`}
                />
                <span className="text-[10px] text-muted-foreground truncate max-w-full w-full text-center">
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DashboardChart
