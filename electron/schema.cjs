/**
 * Definição única das tabelas, usada para gerar o DDL do SQLite local e o do
 * Postgres no Supabase. Manter um só lugar evita os dois lados divergirem.
 *
 * As colunas usam camelCase igual aos objetos do JavaScript (no Postgres ficam
 * entre aspas). Assim a linha do banco e o objeto da interface são a mesma
 * coisa, sem camada de tradução no meio.
 *
 * Toda tabela carrega três colunas de controle, necessárias para sincronizar:
 *   id         — identificador textual, estável entre dispositivos
 *   updatedAt  — ISO 8601; decide quem vence quando os dois lados mudaram
 *   deleted    — exclusão lógica; apagar de verdade impediria propagar a exclusão
 */

const TABLES = {
  customers: {
    name: 'Clientes',
    columns: {
      name: 'TEXT',
      phone: 'TEXT',
      email: 'TEXT',
      birthDate: 'TEXT',
      address: 'TEXT',
      registrationDate: 'TEXT',
      notes: 'TEXT',
      outstandingBalance: 'REAL',
    },
  },
  services: {
    name: 'Serviços',
    columns: {
      name: 'TEXT',
      description: 'TEXT',
      duration: 'INTEGER',
      price: 'REAL',
      status: 'TEXT',
      category: 'TEXT',
    },
  },
  appointments: {
    name: 'Atendimentos',
    columns: {
      customerId: 'TEXT',
      customerName: 'TEXT',
      serviceId: 'TEXT',
      service: 'TEXT',
      date: 'TEXT',
      startTime: 'TEXT',
      endTime: 'TEXT',
      price: 'REAL',
      status: 'TEXT',
      notes: 'TEXT',
    },
  },
  packages: {
    name: 'Pacotes',
    columns: {
      customerId: 'TEXT',
      customerName: 'TEXT',
      serviceId: 'TEXT',
      serviceName: 'TEXT',
      totalSessions: 'INTEGER',
      usedSessions: 'INTEGER',
      price: 'REAL',
      purchaseDate: 'TEXT',
      expiresAt: 'TEXT',
      status: 'TEXT',
    },
  },
  payments: {
    name: 'Pagamentos',
    columns: {
      customerId: 'TEXT',
      customerName: 'TEXT',
      amount: 'REAL',
      date: 'TEXT',
      method: 'TEXT',
      status: 'TEXT',
      reference: 'TEXT',
    },
  },
  products: {
    name: 'Produtos',
    columns: {
      name: 'TEXT',
      sku: 'TEXT',
      category: 'TEXT',
      supplier: 'TEXT',
      costPrice: 'REAL',
      sellingPrice: 'REAL',
      currentStock: 'INTEGER',
      minStockLevel: 'INTEGER',
      unit: 'TEXT',
      status: 'TEXT',
    },
  },
  inventoryTransactions: {
    name: 'Movimentações de estoque',
    columns: {
      productId: 'TEXT',
      product: 'TEXT',
      type: 'TEXT',
      quantity: 'INTEGER',
      reason: 'TEXT',
      date: 'TEXT',
      user: 'TEXT',
    },
  },
  settings: {
    name: 'Configurações',
    columns: {
      key: 'TEXT',
      value: 'TEXT',
    },
  },
}

/** Colunas de controle presentes em toda tabela. */
const CONTROL_COLUMNS = {
  id: 'TEXT',
  updatedAt: 'TEXT',
  deleted: 'INTEGER',
}

const COLLECTIONS = Object.keys(TABLES)

/** Nome da tabela no banco (o Postgres gosta de minúsculas sem aspas). */
function tableName(collection) {
  return collection.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
}

/** Todas as colunas de uma coleção, controle primeiro. */
function columnsOf(collection) {
  return { ...CONTROL_COLUMNS, ...TABLES[collection].columns }
}

const SQLITE_TYPES = { TEXT: 'TEXT', REAL: 'REAL', INTEGER: 'INTEGER' }
const PG_TYPES = { TEXT: 'text', REAL: 'double precision', INTEGER: 'integer' }

function createTableSQL(collection, dialect = 'sqlite') {
  const quote = dialect === 'pg' ? name => `"${name}"` : name => `"${name}"`
  const types = dialect === 'pg' ? PG_TYPES : SQLITE_TYPES
  const columns = columnsOf(collection)

  const defs = Object.entries(columns).map(([column, type]) => {
    if (column === 'id') return `${quote('id')} ${types.TEXT} PRIMARY KEY`
    if (column === 'deleted') return `${quote('deleted')} ${types.INTEGER} NOT NULL DEFAULT 0`
    if (column === 'updatedAt') return `${quote('updatedAt')} ${types.TEXT} NOT NULL`
    return `${quote(column)} ${types[type]}`
  })

  return `CREATE TABLE IF NOT EXISTS ${quote(tableName(collection))} (\n  ${defs.join(',\n  ')}\n)`
}

module.exports = {
  TABLES,
  COLLECTIONS,
  CONTROL_COLUMNS,
  tableName,
  columnsOf,
  createTableSQL,
}
