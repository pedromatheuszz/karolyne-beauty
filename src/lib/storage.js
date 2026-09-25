/**
 * Camada de armazenamento.
 *
 * No aplicativo instalado, conversa com o SQLite do processo principal via IPC.
 * No navegador (`npm run dev`), cai para localStorage com a mesma interface —
 * assim dá para desenvolver sem abrir o Electron, e o resto do código não
 * precisa saber onde os dados estão.
 */

export const COLLECTIONS = [
  'customers',
  'services',
  'appointments',
  'packages',
  'payments',
  'products',
  'inventoryTransactions',
  'settings',
]

const desktop = typeof window !== 'undefined' ? window.karolyne : null

export const isDesktop = Boolean(desktop)

/* ------------------------------ navegador ------------------------------- */

const KEY = collection => `kpb:${collection}`

function readLocal(collection) {
  try {
    return JSON.parse(localStorage.getItem(KEY(collection)) || '[]')
  } catch {
    return []
  }
}

function writeLocal(collection, rows) {
  try {
    localStorage.setItem(KEY(collection), JSON.stringify(rows))
  } catch (error) {
    console.error(`[storage] não foi possível gravar ${collection}:`, error)
  }
}

const browserAdapter = {
  async loadAll() {
    const out = {}
    for (const collection of COLLECTIONS) {
      out[collection] = readLocal(collection).filter(row => !row.deleted)
    }
    return out
  },
  async isEmpty() {
    return COLLECTIONS.every(collection => readLocal(collection).length === 0)
  },
  async upsert(collection, record) {
    const rows = readLocal(collection)
    const stamped = { ...record, updatedAt: new Date().toISOString(), deleted: false }
    const index = rows.findIndex(row => row.id === record.id)
    if (index >= 0) rows[index] = stamped
    else rows.push(stamped)
    writeLocal(collection, rows)
    return stamped
  },
  async upsertMany(collection, records) {
    const rows = readLocal(collection)
    const byId = new Map(rows.map(row => [row.id, row]))
    const now = new Date().toISOString()
    const saved = records.map(record => {
      const stamped = { ...record, updatedAt: now, deleted: false }
      byId.set(record.id, stamped)
      return stamped
    })
    writeLocal(collection, [...byId.values()])
    return saved
  },
  async remove(collection, id) {
    const rows = readLocal(collection).map(row =>
      row.id === id ? { ...row, deleted: true, updatedAt: new Date().toISOString() } : row,
    )
    writeLocal(collection, rows)
    return { id, deleted: true }
  },
  async stats() {
    const counts = {}
    for (const collection of COLLECTIONS) {
      counts[collection] = readLocal(collection).filter(row => !row.deleted).length
    }
    return { path: 'localStorage (navegador)', counts }
  },
  async backup() {
    return { ok: false, reason: 'unsupported' }
  },
  sync: {
    async status() {
      return { configured: false, unavailable: true }
    },
    async now() {
      return { ok: false, reason: 'unsupported' }
    },
    async configure() {
      return { configured: false, reason: 'unsupported' }
    },
  },
}

/* ------------------------------- desktop -------------------------------- */

const desktopAdapter = desktop && {
  loadAll: () => desktop.data.loadAll(),
  isEmpty: () => desktop.data.isEmpty(),
  upsert: (collection, record) => desktop.data.upsert(collection, record),
  upsertMany: (collection, records) => desktop.data.upsertMany(collection, records),
  remove: (collection, id) => desktop.data.remove(collection, id),
  stats: () => desktop.data.stats(),
  backup: () => desktop.data.backup(),
  sync: {
    status: () => desktop.sync.status(),
    now: () => desktop.sync.now(),
    configure: credentials => desktop.sync.configure(credentials),
  },
}

const storage = desktopAdapter || browserAdapter

export default storage

/* ------------------------- utilitários de settings ---------------------- */

/** As configurações são linhas chave/valor; a interface quer um objeto. */
export function settingsToObject(rows = []) {
  return Object.fromEntries(rows.map(row => [row.key, row.value]))
}

export function settingsToRows(object = {}) {
  return Object.entries(object).map(([key, value]) => ({
    id: `set_${key}`,
    key,
    value: String(value),
  }))
}
