import { useEffect, useMemo, useState } from 'react'

import Icon from '../components/ui/Icon'
import { FullLogo } from '../components/ui/Logo'
import StatusBadge from '../components/ui/StatusBadge'
import { serviceCategories } from '../lib/constants'
import storage, { isDesktop } from '../lib/storage'
import { formatCurrency } from '../lib/format'
import { whatsappLink } from '../lib/whatsapp'

const SettingsView = ({ salon, services = [], onSaveSalon, onLoadDemoData }) => {
  const [form, setForm] = useState(salon)
  const [saved, setSaved] = useState(false)
  const [dbStats, setDbStats] = useState(null)
  const [syncState, setSyncState] = useState(null)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState(null)
  const [credentials, setCredentials] = useState({
    url: '',
    anonKey: '',
    email: '',
    password: '',
  })

  // Quando as configurações chegam do banco, o formulário acompanha. Ajustar
  // durante a renderização (e não num efeito) evita o render em cascata.
  const [syncedFrom, setSyncedFrom] = useState(salon)
  if (salon !== syncedFrom) {
    setSyncedFrom(salon)
    setForm(salon)
  }

  useEffect(() => {
    storage.stats().then(setDbStats)
    storage.sync.status().then(setSyncState)
  }, [])

  const handleChange = event => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const byCategory = useMemo(() => {
    const map = new Map(serviceCategories.map(category => [category, []]))
    for (const service of services) {
      const list = map.get(service.category) || []
      list.push(service)
      map.set(service.category, list)
    }
    return [...map.entries()].filter(([, list]) => list.length > 0)
  }, [services])

  const totalRecords = dbStats
    ? Object.values(dbStats.counts).reduce((sum, n) => sum + n, 0)
    : 0

  const run = async (key, action) => {
    setBusy(key)
    setMessage(null)
    try {
      const result = await action()
      setMessage(result)
    } catch (error) {
      setMessage({ tone: 'error', text: error.message })
    } finally {
      setBusy('')
    }
  }

  const handleBackup = () =>
    run('backup', async () => {
      const result = await storage.backup()
      if (result.canceled) return null
      if (!result.ok) return { tone: 'error', text: 'Backup disponível apenas no aplicativo instalado.' }
      return { tone: 'success', text: `Backup salvo em ${result.path}` }
    })

  const handleSync = () =>
    run('sync', async () => {
      const result = await storage.sync.now()
      setSyncState(await storage.sync.status())
      if (result.ok) {
        return {
          tone: 'success',
          text: `Sincronizado: ${result.pushed} enviado(s), ${result.applied} recebido(s).`,
        }
      }
      if (result.reason === 'not-configured') {
        return { tone: 'error', text: 'Informe a URL e a chave do projeto Supabase abaixo.' }
      }
      return { tone: 'error', text: result.message || 'Falha ao sincronizar.' }
    })

  const handleConfigureSync = () =>
    run('configure', async () => {
      const filled = Object.values(credentials).every(value => value.trim())
      if (!filled) {
        return {
          tone: 'error',
          text: 'Preencha a URL, a chave anon e o login do usuário do Supabase.',
        }
      }
      await storage.sync.configure({
        url: credentials.url.trim(),
        anonKey: credentials.anonKey.trim(),
        email: credentials.email.trim(),
        password: credentials.password,
      })
      setSyncState(await storage.sync.status())
      setCredentials({ url: '', anonKey: '', email: '', password: '' })
      return { tone: 'success', text: 'Credenciais salvas. Use "Sincronizar agora" para testar.' }
    })

  const handleDemo = () =>
    run('demo', async () => {
      await onLoadDemoData()
      setDbStats(await storage.stats())
      return { tone: 'success', text: 'Dados de demonstração carregados.' }
    })

  const link = whatsappLink(form.whatsapp)

  return (
    <div className="space-y-4">
      {/* Cartão da marca */}
      <div className="card-surface p-6 relative overflow-hidden">
        <div
          className="absolute -right-12 -bottom-16 w-48 h-48 rounded-full bg-accent-soft/30 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center gap-5">
          <FullLogo imgClassName="h-28" />
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold">{form.name}</h2>
            <p className="text-sm text-muted-foreground">
              {form.owner} · {form.role}
            </p>
            <p className="text-sm text-accent italic mt-0.5">{form.tagline}</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <a
              href={`https://instagram.com/${form.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              @{form.instagram}
            </a>
            {link && (
              <a href={link} target="_blank" rel="noreferrer" className="btn-primary">
                <Icon name="whatsapp" className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={`text-sm rounded-xl border px-4 py-3 ${
            message.tone === 'error'
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-success/30 bg-success/10 text-success'
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Banco de dados */}
      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-semibold mb-1">Banco de dados</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isDesktop
            ? 'Os dados ficam gravados em um arquivo SQLite na sua máquina e continuam lá ao fechar o programa.'
            : 'Na versão do navegador os dados ficam no armazenamento local. O aplicativo instalado usa SQLite.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Registros guardados</p>
            <p className="font-display text-xl font-semibold real">{totalRecords}</p>
          </div>
          <div className="rounded-xl border border-border p-4 md:col-span-2 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Local do arquivo</p>
            <p className="text-sm font-medium break-all">{dbStats?.path ?? '—'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleBackup}
            disabled={!isDesktop || busy === 'backup'}
            className="btn-ghost disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Icon name="box" className="w-4 h-4" />
            {busy === 'backup' ? 'Salvando…' : 'Salvar backup'}
          </button>
          <button
            type="button"
            onClick={handleDemo}
            disabled={busy === 'demo'}
            className="btn-ghost disabled:opacity-45"
          >
            <Icon name="sparkle" className="w-4 h-4" />
            {busy === 'demo' ? 'Carregando…' : 'Carregar dados de demonstração'}
          </button>
        </div>
      </div>

      {/* Sincronização */}
      <div className="card-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <h3 className="font-display text-lg font-semibold">Sincronização com a nuvem</h3>
          <StatusBadge status={syncState?.configured ? 'active' : 'inactive'} />
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Envia uma cópia dos dados para o Supabase e traz de volta o que foi alterado em
          outro dispositivo. O sistema funciona normalmente sem isso — a sincronização é
          backup e acesso de outro lugar, não requisito para usar.
        </p>

        {syncState?.lastSyncAt && (
          <p className="text-xs text-muted-foreground mb-4">
            Última sincronização: {new Date(syncState.lastSyncAt).toLocaleString('pt-BR')}
          </p>
        )}

        {syncState?.configured ? (
          <button
            type="button"
            onClick={handleSync}
            disabled={busy === 'sync'}
            className="btn-primary disabled:opacity-45"
          >
            <Icon name="trending" className="w-4 h-4" />
            {busy === 'sync' ? 'Sincronizando…' : 'Sincronizar agora'}
          </button>
        ) : (
          <div className="rounded-xl border border-border p-4 space-y-3">
            <p className="text-sm">
              Para ligar, crie um projeto no Supabase, rode o script
              <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-xs">
                supabase/schema.sql
              </code>
              no editor SQL dele e cole as credenciais abaixo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="sb-url" className="block text-sm font-medium mb-1.5">
                  URL do projeto
                </label>
                <input
                  id="sb-url"
                  type="url"
                  placeholder="https://xxxx.supabase.co"
                  value={credentials.url}
                  onChange={e => setCredentials(prev => ({ ...prev, url: e.target.value }))}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="sb-key" className="block text-sm font-medium mb-1.5">
                  Chave anon (pública)
                </label>
                <input
                  id="sb-key"
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={credentials.anonKey}
                  onChange={e => setCredentials(prev => ({ ...prev, anonKey: e.target.value }))}
                  className="field"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="sb-email" className="block text-sm font-medium mb-1.5">
                  E-mail do usuário
                </label>
                <input
                  id="sb-email"
                  type="email"
                  autoComplete="off"
                  placeholder="criado em Authentication"
                  value={credentials.email}
                  onChange={e => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="sb-password" className="block text-sm font-medium mb-1.5">
                  Senha
                </label>
                <input
                  id="sb-password"
                  type="password"
                  autoComplete="off"
                  value={credentials.password}
                  onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="field"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              O acesso às tabelas exige usuário autenticado — a chave anon sozinha só
              identifica o projeto, não autoriza leitura nem escrita.
            </p>
            <button
              type="button"
              onClick={handleConfigureSync}
              disabled={!isDesktop || busy === 'configure'}
              className="btn-primary disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {busy === 'configure' ? 'Salvando…' : 'Salvar credenciais'}
            </button>
            {!isDesktop && (
              <p className="text-xs text-muted-foreground">
                A sincronização só funciona no aplicativo instalado.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dados do espaço */}
      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Dados do espaço</h3>
        <form
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          onSubmit={async event => {
            event.preventDefault()
            await onSaveSalon(form)
            setSaved(true)
          }}
        >
          <Field id="name" label="Nome do espaço" value={form.name} onChange={handleChange} />
          <Field id="owner" label="Profissional" value={form.owner} onChange={handleChange} />
          <Field
            id="nickname"
            label="Como o sistema te chama"
            value={form.nickname}
            onChange={handleChange}
          />
          <Field id="role" label="Especialidade" value={form.role} onChange={handleChange} />
          <Field id="tagline" label="Assinatura" value={form.tagline} onChange={handleChange} />
          <Field id="city" label="Cidade" value={form.city} onChange={handleChange} />
          <Field
            id="whatsapp"
            label="WhatsApp (com DDI)"
            value={form.whatsapp}
            onChange={handleChange}
          />
          <Field id="instagram" label="Instagram" value={form.instagram} onChange={handleChange} />
          <Field
            id="openingTime"
            label="Abertura"
            type="time"
            value={form.openingTime}
            onChange={handleChange}
          />
          <Field
            id="closingTime"
            label="Fechamento"
            type="time"
            value={form.closingTime}
            onChange={handleChange}
          />

          <div className="md:col-span-2 xl:col-span-3 flex items-center gap-3">
            <button type="submit" className="btn-primary">
              Salvar alterações
            </button>
            {saved && <span className="text-sm text-success">Configurações salvas.</span>}
          </div>
        </form>
      </div>

      {/* Catálogo */}
      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Catálogo de serviços</h3>
        {byCategory.length === 0 ? (
          <p className="empty-state">Nenhum serviço cadastrado</p>
        ) : (
          <div className="space-y-6">
            {byCategory.map(([category, list]) => (
              <div key={category}>
                <p className="brand-caps text-[10px] text-accent mb-2.5">{category}</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {list.map(service => (
                    <li key={service.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium">{service.name}</span>
                        <StatusBadge status={service.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                      <p className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{service.duration} min</span>
                        <span className="font-display text-lg font-semibold real">
                          {formatCurrency(service.price)}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const Field = ({ id, label, value, onChange, type = 'text' }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1.5">
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      className="field"
    />
  </div>
)

export default SettingsView
