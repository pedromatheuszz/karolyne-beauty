import { useCallback, useEffect, useMemo, useState } from 'react'

import storage, { settingsToObject, settingsToRows } from '../lib/storage'
import { CATALOG, buildDemoData, salonDefaults } from '../data/seed'

const EMPTY = {
  customers: [],
  services: [],
  appointments: [],
  packages: [],
  payments: [],
  products: [],
  inventoryTransactions: [],
  settings: [],
}

/**
 * Carrega o banco inteiro na memória e expõe as operações de escrita.
 *
 * O volume aqui é pequeno (centenas de registros), então manter tudo em memória
 * e regravar no banco a cada alteração é mais simples e mais rápido do que
 * consultar o SQLite a cada render. A escrita é otimista: o estado muda na hora
 * e o banco é atualizado em seguida; se a gravação falhar, recarrega do banco
 * para a tela não continuar mostrando algo que não foi salvo.
 */
export function useDatabase() {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    const fresh = await storage.loadAll()
    setData({ ...EMPTY, ...fresh })
    return fresh
  }, [])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const empty = await storage.isEmpty()
        if (empty) {
          // Primeira abertura: entra só o catálogo de serviços e os dados do
          // espaço. Cliente e agendamento ficam vazios de propósito.
          await storage.upsertMany('services', CATALOG.services)
          await storage.upsertMany('settings', CATALOG.settings)
        }
        const fresh = await storage.loadAll()
        if (!cancelled) setData({ ...EMPTY, ...fresh })
      } catch (bootError) {
        console.error('[useDatabase] falha ao abrir o banco:', bootError)
        if (!cancelled) setError(bootError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const save = useCallback(
    async (collection, record) => {
      setData(prev => {
        const rows = prev[collection] || []
        const index = rows.findIndex(row => row.id === record.id)
        const next = index >= 0 ? rows.map(r => (r.id === record.id ? record : r)) : [...rows, record]
        return { ...prev, [collection]: next }
      })

      try {
        await storage.upsert(collection, record)
      } catch (saveError) {
        console.error(`[useDatabase] falha ao salvar em ${collection}:`, saveError)
        setError(saveError)
        await reload()
      }
    },
    [reload],
  )

  const saveMany = useCallback(
    async (collection, records) => {
      if (records.length === 0) return
      setData(prev => {
        const byId = new Map((prev[collection] || []).map(row => [row.id, row]))
        for (const record of records) byId.set(record.id, record)
        return { ...prev, [collection]: [...byId.values()] }
      })

      try {
        await storage.upsertMany(collection, records)
      } catch (saveError) {
        console.error(`[useDatabase] falha ao salvar em ${collection}:`, saveError)
        setError(saveError)
        await reload()
      }
    },
    [reload],
  )

  const remove = useCallback(
    async (collection, id) => {
      setData(prev => ({
        ...prev,
        [collection]: (prev[collection] || []).filter(row => row.id !== id),
      }))

      try {
        await storage.remove(collection, id)
      } catch (removeError) {
        console.error(`[useDatabase] falha ao excluir de ${collection}:`, removeError)
        setError(removeError)
        await reload()
      }
    },
    [reload],
  )

  /** Dados de demonstração — só entram quando pedidos nas Configurações. */
  const loadDemoData = useCallback(async () => {
    const demo = buildDemoData()
    for (const [collection, records] of Object.entries(demo)) {
      await storage.upsertMany(collection, records)
    }
    await reload()
  }, [reload])

  const salon = useMemo(
    () => ({ ...salonDefaults, ...settingsToObject(data.settings) }),
    [data.settings],
  )

  const saveSalon = useCallback(
    async next => {
      const rows = settingsToRows(next)
      setData(prev => ({ ...prev, settings: rows }))
      try {
        await storage.upsertMany('settings', rows)
      } catch (saveError) {
        console.error('[useDatabase] falha ao salvar configurações:', saveError)
        setError(saveError)
        await reload()
      }
    },
    [reload],
  )

  return {
    ...data,
    salon,
    loading,
    error,
    save,
    saveMany,
    remove,
    reload,
    loadDemoData,
    saveSalon,
  }
}
