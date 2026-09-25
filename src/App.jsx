import { useEffect, useMemo, useState } from 'react'

import AppointmentsView from './views/AppointmentsView'
import CustomersView from './views/CustomersView'
import DashboardView from './views/DashboardView'
import InventoryView from './views/InventoryView'
import PackagesView from './views/PackagesView'
import PaymentsView from './views/PaymentsView'
import ReportsView from './views/ReportsView'
import SettingsView from './views/SettingsView'

import DateFilter from './components/ui/DateFilter'
import Icon from './components/ui/Icon'
import Logo, { BrandMark } from './components/ui/Logo'

import { useDatabase } from './hooks/useDatabase'
import { newId } from './lib/constants'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Visão geral', icon: 'dashboard' },
  { id: 'appointments', label: 'Agenda', icon: 'calendar' },
  { id: 'customers', label: 'Clientes', icon: 'users' },
  { id: 'packages', label: 'Pacotes', icon: 'ticket' },
  { id: 'payments', label: 'Financeiro', icon: 'card' },
  { id: 'inventory', label: 'Estoque', icon: 'box' },
  { id: 'reports', label: 'Relatórios', icon: 'chart' },
  { id: 'settings', label: 'Configurações', icon: 'settings' },
]

// Views que não são recortadas por período, então escondem a barra de filtro.
const VIEWS_WITHOUT_DATE_FILTER = new Set(['inventory', 'packages', 'settings'])

const SUBTITLES = {
  appointments: 'Sessões agendadas e histórico de atendimentos',
  customers: 'Ficha, histórico e pacotes de cada cliente',
  packages: 'Sessões vendidas, consumidas e a vencer',
  payments: 'Recebimentos, pendências e inadimplência',
  inventory: 'Produtos, consumo e reposição',
  reports: 'Indicadores do período',
  settings: 'Dados do espaço, backup e sincronização',
}

export default function App() {
  const db = useDatabase()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedView, setSelectedView] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [currentFilter, setCurrentFilter] = useState('this-month')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const currentNavItem = useMemo(
    () => NAV_ITEMS.find(item => item.id === selectedView),
    [selectedView],
  )

  // Rótulos da sidebar: escondidos na trilha de ícones e quando recolhida à mão.
  const labelClass = sidebarCollapsed ? 'hidden' : 'hidden lg:inline'

  /** Registro novo ganha id; edição preserva o existente. */
  const persist = (collection, prefix) => record =>
    db.save(collection, { ...record, id: record.id ?? newId(prefix) })

  const handleSaveAppointment = persist('appointments', 'apt')
  const handleSaveProduct = persist('products', 'prd')
  const handleSavePackage = persist('packages', 'pkg')
  const handleRegisterPayment = persist('payments', 'pay')
  const handleSaveCustomer = persist('customers', 'cus')

  /** Consome uma sessão do pacote e fecha-o quando a última é usada. */
  const handleUseSession = packageId => {
    const pkg = db.packages.find(item => item.id === packageId)
    if (!pkg || pkg.usedSessions >= pkg.totalSessions) return

    const usedSessions = pkg.usedSessions + 1
    db.save('packages', {
      ...pkg,
      usedSessions,
      status: usedSessions >= pkg.totalSessions ? 'completed' : pkg.status,
    })
  }

  if (db.loading) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <BrandMark className="w-16 animate-pulse" />
          <p className="text-sm text-muted-foreground">Abrindo o banco de dados…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Trilha de ícones abaixo de lg, rótulos completos a partir daí. */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-16 lg:w-64'
          } shrink-0 bg-card border-r border-border transition-[width] duration-200 flex flex-col`}
        >
          <div className="h-20 flex items-center justify-center lg:justify-start px-3 border-b border-border">
            {/* Trilha estreita e modo recolhido mostram só o símbolo. */}
            <Logo
              showWordmark={!sidebarCollapsed}
              wordmarkClassName="hidden lg:flex"
              markClassName="w-10"
            />
          </div>

          <nav className="p-2.5 flex-1">
            <ul className="space-y-1">
              {NAV_ITEMS.map(item => {
                const isActive = selectedView === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedView(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      title={item.label}
                      className={`w-full flex items-center justify-center ${
                        sidebarCollapsed ? '' : 'lg:justify-start'
                      } px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent text-accent-foreground shadow-sm'
                          : 'hover:bg-muted text-foreground/80'
                      }`}
                    >
                      <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
                      <span className={`${labelClass} ml-2.5`}>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-2.5 border-t border-border">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(value => !value)}
              aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border p-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <Icon name="menu" className="w-4 h-4" />
              <span className={labelClass}>Recolher</span>
            </button>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-md border-b border-border">
            <div className="min-h-20 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-display text-[26px] leading-tight font-semibold truncate">
                  {currentNavItem?.label}
                </h1>
                <p className="text-[13px] text-muted-foreground truncate">
                  {SUBTITLES[selectedView] ?? db.salon.tagline}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden md:flex flex-col items-end leading-tight mr-1">
                  <span className="text-sm font-medium">{db.salon.nickname}</span>
                  <span className="text-[11px] text-muted-foreground">{db.salon.role}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDarkMode(value => !value)}
                  aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                  className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <Icon name={darkMode ? 'sun' : 'moon'} className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {!VIEWS_WITHOUT_DATE_FILTER.has(selectedView) && (
              <div className="px-4 md:px-8 pb-3">
                <DateFilter onFilterChange={setCurrentFilter} currentFilter={currentFilter} />
              </div>
            )}
          </header>

          <div className="p-4 md:p-8 flex-1 fade-in" key={selectedView}>
            {selectedView === 'dashboard' && (
              <DashboardView
                salon={db.salon}
                customers={db.customers}
                appointments={db.appointments}
                products={db.products}
                payments={db.payments}
                packages={db.packages}
                currentFilter={currentFilter}
              />
            )}
            {selectedView === 'appointments' && (
              <AppointmentsView
                appointments={db.appointments}
                customers={db.customers}
                services={db.services}
                currentFilter={currentFilter}
                onSaveAppointment={handleSaveAppointment}
              />
            )}
            {selectedView === 'customers' && (
              <CustomersView
                customers={db.customers}
                appointments={db.appointments}
                payments={db.payments}
                packages={db.packages}
                onSaveCustomer={handleSaveCustomer}
              />
            )}
            {selectedView === 'packages' && (
              <PackagesView
                packages={db.packages}
                customers={db.customers}
                services={db.services}
                onSavePackage={handleSavePackage}
                onUseSession={handleUseSession}
              />
            )}
            {selectedView === 'payments' && (
              <PaymentsView
                payments={db.payments}
                customers={db.customers}
                currentFilter={currentFilter}
                onRegisterPayment={handleRegisterPayment}
              />
            )}
            {selectedView === 'inventory' && (
              <InventoryView
                products={db.products}
                transactions={db.inventoryTransactions}
                onSaveProduct={handleSaveProduct}
              />
            )}
            {selectedView === 'reports' && (
              <ReportsView
                appointments={db.appointments}
                customers={db.customers}
                products={db.products}
                payments={db.payments}
                packages={db.packages}
                currentFilter={currentFilter}
              />
            )}
            {selectedView === 'settings' && (
              <SettingsView
                salon={db.salon}
                services={db.services}
                onSaveSalon={db.saveSalon}
                onLoadDemoData={db.loadDemoData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
