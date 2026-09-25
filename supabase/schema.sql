-- Esquema do Supabase (Postgres) para o Karolyne Paola Beauty.
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


-- Clientes
CREATE TABLE IF NOT EXISTS "customers" (
  "id" text PRIMARY KEY,
  "updatedAt" text NOT NULL,
  "deleted" integer NOT NULL DEFAULT 0,
  "name" text,
  "phone" text,
  "email" text,
  "birthDate" text,
  "address" text,
  "registrationDate" text,
  "notes" text,
  "outstandingBalance" double precision
);
CREATE INDEX IF NOT EXISTS "idx_customers_updatedAt" ON "customers" ("updatedAt");

-- Serviços
CREATE TABLE IF NOT EXISTS "services" (
  "id" text PRIMARY KEY,
  "updatedAt" text NOT NULL,
  "deleted" integer NOT NULL DEFAULT 0,
  "name" text,
  "description" text,
  "duration" integer,
  "price" double precision,
  "status" text,
  "category" text
);
CREATE INDEX IF NOT EXISTS "idx_services_updatedAt" ON "services" ("updatedAt");

-- Atendimentos
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" text PRIMARY KEY,
  "updatedAt" text NOT NULL,
  "deleted" integer NOT NULL DEFAULT 0,
  "customerId" text,
  "customerName" text,
  "serviceId" text,
  "service" text,
  "date" text,
  "startTime" text,
  "endTime" text,
  "price" double precision,
  "status" text,
  "notes" text
);
CREATE INDEX IF NOT EXISTS "idx_appointments_updatedAt" ON "appointments" ("updatedAt");

-- Pacotes
CREATE TABLE IF NOT EXISTS "packages" (
  "id" text PRIMARY KEY,
  "updatedAt" text NOT NULL,
  "deleted" integer NOT NULL DEFAULT 0,
  "customerId" text,
  "customerName" text,
  "serviceId" text,
  "serviceName" text,
  "totalSessions" integer,
  "usedSessions" integer,
  "price" double precision,
  "purchaseDate" text,
  "expiresAt" text,
  "status" text
);
CREATE INDEX IF NOT EXISTS "idx_packages_updatedAt" ON "packages" ("updatedAt");

-- Pagamentos
CREATE TABLE IF NOT EXISTS "payments" (
  "id" text PRIMARY KEY,
  "updatedAt" text NOT NULL,
  "deleted" integer NOT NULL DEFAULT 0,
  "customerId" text,
  "customerName" text,
  "amount" double precision,
  "date" text,
  "method" text,
  "status" text,
  "reference" text
);
CREATE INDEX IF NOT EXISTS "idx_payments_updatedAt" ON "payments" ("updatedAt");

-- Produtos
CREATE TABLE IF NOT EXISTS "products" (
  "id" text PRIMARY KEY,
  "updatedAt" text NOT NULL,
  "deleted" integer NOT NULL DEFAULT 0,
  "name" text,
  "sku" text,
  "category" text,
  "supplier" text,
  "costPrice" double precision,
  "sellingPrice" double precision,
  "currentStock" integer,
  "minStockLevel" integer,
  "unit" text,
  "status" text
);
CREATE INDEX IF NOT EXISTS "idx_products_updatedAt" ON "products" ("updatedAt");

-- Movimentações de estoque
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
  "id" text PRIMARY KEY,
  "updatedAt" text NOT NULL,
  "deleted" integer NOT NULL DEFAULT 0,
  "productId" text,
  "product" text,
  "type" text,
  "quantity" integer,
  "reason" text,
  "date" text,
  "user" text
);
CREATE INDEX IF NOT EXISTS "idx_inventory_transactions_updatedAt" ON "inventory_transactions" ("updatedAt");

-- Configurações
CREATE TABLE IF NOT EXISTS "settings" (
  "id" text PRIMARY KEY,
  "updatedAt" text NOT NULL,
  "deleted" integer NOT NULL DEFAULT 0,
  "key" text,
  "value" text
);
CREATE INDEX IF NOT EXISTS "idx_settings_updatedAt" ON "settings" ("updatedAt");

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
-- ---------------------------------------------------------------------------

ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customers_rw" ON "customers";
CREATE POLICY "customers_rw" ON "customers"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_rw" ON "services";
CREATE POLICY "services_rw" ON "services"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appointments_rw" ON "appointments";
CREATE POLICY "appointments_rw" ON "appointments"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE "packages" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "packages_rw" ON "packages";
CREATE POLICY "packages_rw" ON "packages"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_rw" ON "payments";
CREATE POLICY "payments_rw" ON "payments"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_rw" ON "products";
CREATE POLICY "products_rw" ON "products"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE "inventory_transactions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventory_transactions_rw" ON "inventory_transactions";
CREATE POLICY "inventory_transactions_rw" ON "inventory_transactions"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_rw" ON "settings";
CREATE POLICY "settings_rw" ON "settings"
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
