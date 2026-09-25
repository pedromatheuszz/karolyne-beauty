/**
 * Sincronização entre o SQLite local e o Supabase.
 *
 * O local é sempre a fonte da verdade para uso: o sistema funciona inteiro sem
 * internet. A nuvem serve como backup e como ponte para outro dispositivo.
 *
 * Estratégia: "quem escreveu por último vence", comparando `updatedAt`. É
 * suficiente aqui porque há uma profissional usando o sistema — duas edições
 * simultâneas do mesmo registro em máquinas diferentes praticamente não
 * acontecem. Exclusões viajam como `deleted = 1`, nunca como remoção física,
 * senão o outro lado reinseriria o registro no próximo ciclo.
 */
const fs = require('node:fs')
const path = require('node:path')

const db = require('./db.cjs')
const { COLLECTIONS, tableName } = require('./schema.cjs')

const LAST_PULL_KEY = 'lastPulledAt'
const CONFIG_FILE = 'supabase.json'

let client = null
let configDir = null
let signedIn = false

/**
 * Credenciais: variáveis de ambiente vencem, senão um JSON em userData.
 * Ficam fora do banco de propósito — não faz sentido sincronizar a própria
 * credencial de sincronização.
 */
function readConfig() {
  const fromEnv = {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    email: process.env.SUPABASE_EMAIL,
    password: process.env.SUPABASE_PASSWORD,
  }
  if (fromEnv.url && fromEnv.anonKey) return fromEnv

  const file = path.join(configDir, CONFIG_FILE)
  if (!fs.existsSync(file)) return null
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return parsed.url && parsed.anonKey ? parsed : null
  } catch {
    return null
  }
}

function writeConfig({ url, anonKey, email, password }) {
  const file = path.join(configDir, CONFIG_FILE)
  fs.writeFileSync(file, JSON.stringify({ url, anonKey, email, password }, null, 2), 'utf8')
  // Só o dono da máquina lê o arquivo: ele guarda a senha do Supabase.
  try {
    fs.chmodSync(file, 0o600)
  } catch {
    // Em alguns sistemas de arquivos do Windows chmod não se aplica; segue.
  }
  client = null // força recriar com as credenciais novas
  signedIn = false
  return { configured: true }
}

function init(userDataDir) {
  configDir = userDataDir
}

function getClient() {
  if (client) return client

  const config = readConfig()
  if (!config) return null

  // Import tardio: sem credenciais o app nem carrega a biblioteca.
  const { createClient } = require('@supabase/supabase-js')
  client = createClient(config.url, config.anonKey, {
    auth: { persistSession: false },
  })
  return client
}

function isConfigured() {
  return Boolean(readConfig())
}

/** Só o que mudou desde o último envio bem-sucedido. */
function collectLocalChanges(since) {
  const changes = {}
  let total = 0
  for (const collection of COLLECTIONS) {
    const rows = db.changedSince(collection, since).map(row => ({
      ...row,
      deleted: row.deleted ? true : false,
    }))
    if (rows.length > 0) {
      changes[collection] = rows
      total += rows.length
    }
  }
  return { changes, total }
}

async function push(supabase, since) {
  const { changes, total } = collectLocalChanges(since)
  if (total === 0) return { pushed: 0 }

  for (const [collection, rows] of Object.entries(changes)) {
    const { error } = await supabase
      .from(tableName(collection))
      .upsert(rows, { onConflict: 'id' })
    if (error) {
      throw new Error(`falha ao enviar ${collection}: ${error.message}`)
    }
  }
  return { pushed: total }
}

async function pull(supabase, since) {
  let applied = 0
  let newest = since

  for (const collection of COLLECTIONS) {
    let query = supabase.from(tableName(collection)).select('*')
    if (since) query = query.gt('updatedAt', since)

    const { data, error } = await query
    if (error) throw new Error(`falha ao baixar ${collection}: ${error.message}`)
    if (!data || data.length === 0) continue

    // Só aplica o remoto quando ele é mais novo que a cópia local.
    const locals = new Map(
      db.changedSince(collection, null).map(row => [row.id, row.updatedAt]),
    )
    const winners = data.filter(remote => {
      const localUpdatedAt = locals.get(remote.id)
      return !localUpdatedAt || remote.updatedAt > localUpdatedAt
    })

    if (winners.length > 0) {
      db.upsertMany(collection, winners, { stamp: false })
      applied += winners.length
    }

    for (const remote of data) {
      if (!newest || remote.updatedAt > newest) newest = remote.updatedAt
    }
  }

  return { applied, newest }
}

/**
 * As políticas RLS do schema.sql liberam acesso só para usuário autenticado —
 * a chave anon sozinha identifica o projeto, não autoriza nada. Por isso é
 * preciso entrar com o usuário criado no Authentication do Supabase.
 */
async function ensureSignedIn(supabase) {
  if (signedIn) return { ok: true }

  const config = readConfig()
  if (!config.email || !config.password) {
    return { ok: false, reason: 'no-credentials' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: config.email,
    password: config.password,
  })
  if (error) return { ok: false, reason: 'auth', message: error.message }

  signedIn = true
  return { ok: true }
}

/**
 * Um ciclo completo. Envia primeiro para que o que a Karol acabou de fazer
 * não seja sobrescrito por uma versão antiga vinda da nuvem.
 */
async function syncNow() {
  const supabase = getClient()
  if (!supabase) {
    return { ok: false, reason: 'not-configured' }
  }

  const auth = await ensureSignedIn(supabase)
  if (!auth.ok) {
    if (auth.reason === 'no-credentials') {
      return {
        ok: false,
        reason: 'error',
        message: 'Informe o e-mail e a senha do usuário criado no Supabase.',
      }
    }
    return { ok: false, reason: 'error', message: `Login recusado: ${auth.message}` }
  }

  const startedAt = new Date().toISOString()
  const lastPulledAt = db.getMeta(LAST_PULL_KEY)

  try {
    const pushed = await push(supabase, db.getMeta('lastPushedAt'))
    db.setMeta('lastPushedAt', startedAt)

    const pulled = await pull(supabase, lastPulledAt)
    db.setMeta(LAST_PULL_KEY, pulled.newest || startedAt)
    db.setMeta('lastSyncAt', startedAt)

    return {
      ok: true,
      pushed: pushed.pushed,
      applied: pulled.applied,
      at: startedAt,
    }
  } catch (error) {
    db.setMeta('lastSyncError', error.message)
    return { ok: false, reason: 'error', message: error.message }
  }
}

function status() {
  const config = readConfig()
  return {
    configured: Boolean(config),
    hasLogin: Boolean(config && config.email && config.password),
    lastSyncAt: db.getMeta('lastSyncAt'),
    lastSyncError: db.getMeta('lastSyncError'),
  }
}

module.exports = { init, isConfigured, writeConfig, syncNow, status }
