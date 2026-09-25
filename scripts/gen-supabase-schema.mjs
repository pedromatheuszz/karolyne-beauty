// Gera supabase/schema.sql a partir da mesma definição usada pelo SQLite,
// para os dois lados nunca divergirem.
import { writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { COLLECTIONS, TABLES, tableName, createTableSQL } = require(
  process.argv[2] || './electron/schema.cjs',
)

const header = `-- Esquema do Supabase (Postgres) para o Karolyne Paola Beauty.
--
-- Gerado a partir de electron/schema.cjs — se mudar as tabelas lá, gere de novo
-- em vez de editar este arquivo à mão.
--
-- Como aplicar: abra o projeto no Supabase, vá em SQL Editor, cole tudo e rode.
--
-- As colunas usam camelCase entre aspas, iguais aos campos do JavaScript.
-- Toda tabela tem:
--   id         chave primária textual, gerada no aplicativo
--   "updatedAt" ISO 8601, usado para decidir quem vence na sincronização
--   deleted    exclusão lógica — apagar de verdade impediria propagar a exclusão
`

const parts = [header]

for (const collection of COLLECTIONS) {
  const table = tableName(collection)
  parts.push(`\n-- ${TABLES[collection].name}`)
  parts.push(`${createTableSQL(collection, 'pg')};`)
  parts.push(
    `CREATE INDEX IF NOT EXISTS "idx_${table}_updatedAt" ON "${table}" ("updatedAt");`,
  )
}

parts.push(`
-- ---------------------------------------------------------------------------
-- Segurança
--
-- RLS fica LIGADO em todas as tabelas. As políticas abaixo liberam leitura e
-- escrita para usuários autenticados — ou seja, é preciso criar um usuário no
-- Authentication do Supabase e entrar com ele.
--
-- A chave anon sozinha NÃO dá acesso: ela só identifica o projeto. Se você
-- preferir que o aplicativo sincronize sem login, troque 'authenticated' por
-- 'anon' nas políticas — mas aí qualquer pessoa com a chave e a URL consegue
-- ler e escrever os dados das clientes. Não recomendo.
-- ---------------------------------------------------------------------------`)

for (const collection of COLLECTIONS) {
  const table = tableName(collection)
  parts.push(`
ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "${table}_rw" ON "${table}";
CREATE POLICY "${table}_rw" ON "${table}"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);`)
}

mkdirSync('supabase', { recursive: true })
writeFileSync('supabase/schema.sql', `${parts.join('\n')}\n`, 'utf8')
console.log(`supabase/schema.sql gerado (${COLLECTIONS.length} tabelas)`)
