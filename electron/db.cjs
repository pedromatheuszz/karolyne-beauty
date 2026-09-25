/**
 * Banco local em SQLite, dono da verdade dos dados.
 *
 * Usa node-sqlite3-wasm: é SQLite de verdade, gravando um arquivo .sqlite em
 * disco, mas compilado para WebAssembly — não exige compilador C++ na máquina
 * de quem instala nem quebra quando o Electron muda de versão.
 *
 * O arquivo fica em app.getPath('userData'), que sobrevive a desinstalar e
 * reinstalar o programa.
 */
const path = require('node:path')
const fs = require('node:fs')
const { Database } = require('node-sqlite3-wasm')

const { COLLECTIONS, columnsOf, tableName, createTableSQL } = require('./schema.cjs')

let db = null
let dbPath = null

function open(userDataDir) {
  if (db) return db

  dbPath = path.join(userDataDir, 'karolyne-beauty.sqlite')
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  db = new Database(dbPath)
  // WAL deixa leitura e escrita concorrerem sem travar uma à outra.
  db.run('PRAGMA journal_mode = WAL')
  db.run('PRAGMA foreign_keys = ON')

  for (const collection of COLLECTIONS) {
    db.run(createTableSQL(collection, 'sqlite'))
    // Índice por updatedAt: a sincronização sempre busca "o que mudou depois de X".
    db.run(
      `CREATE INDEX IF NOT EXISTS "idx_${tableName(collection)}_updatedAt" ` +
        `ON "${tableName(collection)}" ("updatedAt")`,
    )
  }

  // Chave/valor para o estado da sincronização (ex.: data do último pull).
  db.run(`CREATE TABLE IF NOT EXISTS "sync_meta" ("key" TEXT PRIMARY KEY, "value" TEXT)`)

  return db
}

function ensureOpen() {
  if (!db) throw new Error('banco não inicializado')
  return db
}

/** Converte a linha do SQLite de volta para o formato usado na interface. */
function fromRow(row) {
  if (!row) return null
  return { ...row, deleted: row.deleted === 1 }
}

/** Lê uma coleção inteira. Por padrão esconde os registros excluídos. */
function list(collection, { includeDeleted = false } = {}) {
  const sql = `SELECT * FROM "${tableName(collection)}"${includeDeleted ? '' : ' WHERE "deleted" = 0'}`
  return ensureOpen().all(sql).map(fromRow)
}

/** Lê tudo de uma vez — a interface carrega o banco inteiro na memória. */
function loadAll() {
  const out = {}
  for (const collection of COLLECTIONS) out[collection] = list(collection)
  return out
}

/** Registros alterados depois de `since` (ISO), incluindo os excluídos. */
function changedSince(collection, since) {
  const sql = since
    ? `SELECT * FROM "${tableName(collection)}" WHERE "updatedAt" > ?`
    : `SELECT * FROM "${tableName(collection)}"`
  return ensureOpen()
    .all(sql, since ? [since] : [])
    .map(fromRow)
}

/**
 * Insere ou atualiza. `updatedAt` é carimbado aqui, a não ser que venha pronto
 * (caso da sincronização, que precisa preservar o horário de origem).
 */
function upsert(collection, record, { stamp = true } = {}) {
  const columns = columnsOf(collection)
  const row = { ...record }

  if (!row.id) throw new Error(`registro sem id em ${collection}`)
  if (stamp || !row.updatedAt) row.updatedAt = new Date().toISOString()
  row.deleted = row.deleted ? 1 : 0

  const names = Object.keys(columns)
  const values = names.map(name => {
    const value = row[name]
    if (value === undefined || value === null) return null
    return typeof value === 'boolean' ? (value ? 1 : 0) : value
  })

  const placeholders = names.map(() => '?').join(', ')
  const updates = names
    .filter(name => name !== 'id')
    .map(name => `"${name}" = excluded."${name}"`)
    .join(', ')

  ensureOpen().run(
    `INSERT INTO "${tableName(collection)}" (${names.map(n => `"${n}"`).join(', ')}) ` +
      `VALUES (${placeholders}) ` +
      `ON CONFLICT("id") DO UPDATE SET ${updates}`,
    values,
  )

  return fromRow(row)
}

function upsertMany(collection, records, options) {
  const database = ensureOpen()
  database.run('BEGIN')
  try {
    const saved = records.map(record => upsert(collection, record, options))
    database.run('COMMIT')
    return saved
  } catch (error) {
    database.run('ROLLBACK')
    throw error
  }
}

/**
 * Exclusão lógica: o registro fica no banco marcado como excluído, senão a
 * exclusão não teria como ser propagada para o outro dispositivo.
 */
function remove(collection, id) {
  ensureOpen().run(
    `UPDATE "${tableName(collection)}" SET "deleted" = 1, "updatedAt" = ? WHERE "id" = ?`,
    [new Date().toISOString(), id],
  )
  return { id, deleted: true }
}

function getMeta(key) {
  const row = ensureOpen().get('SELECT "value" FROM "sync_meta" WHERE "key" = ?', [key])
  return row ? row.value : null
}

function setMeta(key, value) {
  ensureOpen().run(
    'INSERT INTO "sync_meta" ("key", "value") VALUES (?, ?) ' +
      'ON CONFLICT("key") DO UPDATE SET "value" = excluded."value"',
    [key, String(value)],
  )
}

function isEmpty() {
  return COLLECTIONS.every(
    collection =>
      ensureOpen().get(`SELECT COUNT(*) AS n FROM "${tableName(collection)}"`).n === 0,
  )
}

function stats() {
  const counts = {}
  for (const collection of COLLECTIONS) {
    counts[collection] = ensureOpen().get(
      `SELECT COUNT(*) AS n FROM "${tableName(collection)}" WHERE "deleted" = 0`,
    ).n
  }
  return { path: dbPath, counts }
}

/** Cópia do arquivo do banco, para backup manual. */
function backupTo(destination) {
  ensureOpen()
  fs.copyFileSync(dbPath, destination)
  return destination
}

function close() {
  if (db) {
    db.close()
    db = null
  }
}

module.exports = {
  open,
  close,
  loadAll,
  list,
  changedSince,
  upsert,
  upsertMany,
  remove,
  getMeta,
  setMeta,
  isEmpty,
  stats,
  backupTo,
  get path() {
    return dbPath
  },
}
