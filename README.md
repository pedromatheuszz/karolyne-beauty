# Karolyne Paola Beauty — Sistema de gestão

Sistema de gestão para o espaço de **massoterapia e estética** da Karolyne Paola
(Joinville/SC). React 19 + Vite 8 + Tailwind CSS 4.

Os dados são permanentes. No aplicativo instalado ficam em um banco **SQLite** na pasta de
dados do usuário; no navegador (`npm run dev`), em `localStorage`. Opcionalmente sincronizam
com o **Supabase**, que serve de backup e ponte para outro dispositivo.

## Como rodar

```bash
npm install
npm run dev
```

A aplicação sobe em http://localhost:5050.

| Script            | O que faz                            |
| ----------------- | ------------------------------------ |
| `npm run dev`      | Servidor de desenvolvimento com HMR            |
| `npm run build`    | Build de produção em `dist/`                   |
| `npm run preview`  | Serve o build de produção localmente           |
| `npm run lint`     | Oxlint sobre `src/`                            |
| `npm run electron` | Abre o `dist/` já buildado na janela do Electron |
| `npm run dist`     | Build + instalador `.exe` em `release/`        |
| `npm run dist:dir` | Build + pasta executável, sem gerar instalador |
| `npm run schema`   | Regera `supabase/schema.sql` a partir do esquema |

## Dados

A definição das tabelas vive em um lugar só, `electron/schema.cjs`, e dela saem tanto o DDL
do SQLite local quanto o `supabase/schema.sql`. Mudou tabela? Rode `npm run schema`.

```
electron/db.cjs      SQLite local (node-sqlite3-wasm) — a fonte da verdade
electron/sync.cjs    envia e recebe alterações do Supabase
electron/preload.cjs ponte IPC; a interface nunca toca em Node direto
src/lib/storage.js   adaptador: Electron → SQLite, navegador → localStorage
src/hooks/useDatabase.js  carrega tudo em memória e expõe as escritas
```

Toda tabela tem três colunas de controle: `id` (texto, gerado no app), `updatedAt` (ISO) e
`deleted` (exclusão lógica). As duas últimas existem para a sincronização — sem `updatedAt`
não dá para saber quem escreveu por último, e sem `deleted` uma exclusão feita aqui seria
desfeita pela nuvem no ciclo seguinte.

Na primeira abertura entram apenas o catálogo de serviços e os dados do espaço. Clientes e
agendamentos começam vazios de propósito: um sistema em uso não deve nascer com cliente
fictício na agenda. Há um botão em Configurações para carregar dados de demonstração quando
for preciso mostrar o sistema para alguém.

### Backup

Configurações → **Salvar backup** grava uma cópia do arquivo `.sqlite` onde você escolher.
Restaurar é copiar esse arquivo de volta para a pasta de dados, com o programa fechado.

### Sincronização com o Supabase (opcional)

1. Crie um projeto no [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e rode o conteúdo de `supabase/schema.sql`.
3. Em **Authentication → Users**, crie um usuário com e-mail e senha. As políticas RLS do
   script liberam acesso apenas para usuário autenticado: a chave anon sozinha identifica o
   projeto, mas não autoriza ler nem gravar.
4. Em Configurações → Sincronização, informe a **URL do projeto**, a **chave anon** e o
   **e-mail e senha** desse usuário.

As credenciais ficam em `supabase.json` na pasta de dados do usuário, fora do banco e fora
do repositório. Também dá para passá-las por `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_EMAIL` e `SUPABASE_PASSWORD`.

A resolução de conflito é "quem escreveu por último vence", comparando `updatedAt`. É
adequado para uma profissional usando o sistema; se um dia houver várias pessoas editando o
mesmo registro ao mesmo tempo, isso precisa ser revisto.

## Aplicativo para Windows

O sistema também é empacotado como aplicativo de desktop com Electron. O processo
principal fica em `electron/main.cjs` e o instalador (NSIS, em português) é configurado
pela chave `build` do `package.json`.

```bash
npm run dist
```

Gera `release/Karolyne-Paola-Beauty-Setup-<versão>.exe`. A instalação é por usuário, sem
pedir administrador, e cria atalhos na área de trabalho e no menu Iniciar.

Detalhes que valem saber:

- **O `vite.config.js` usa `base: './'`.** O app empacotado carrega o `index.html` por
  `file://`, onde caminhos absolutos (`/assets/...`) apontariam para a raiz do disco.
- **O instalador não é assinado digitalmente.** O Windows SmartScreen vai exibir um aviso
  de "aplicativo não reconhecido" na primeira execução; é preciso clicar em "Mais
  informações" → "Executar assim mesmo". Remover o aviso exige um certificado de
  assinatura de código (pago, emitido por uma autoridade certificadora).
- **As fontes vêm do Google Fonts pela rede.** Sem internet, a tipografia cai para as
  fontes do sistema. Para o app ficar 100% offline, as fontes precisam ser embutidas.
- **Para levantar o Electron contra o servidor de desenvolvimento**, defina
  `VITE_DEV_SERVER_URL=http://localhost:5050` antes de `npm run electron`.

## Módulos

- **Visão geral** — saudação, receita e ticket médio do período, agenda do dia com botão de
  confirmação por WhatsApp, painel "precisa de atenção" (pacotes a vencer, pagamentos em
  atraso, produtos para repor) e gráficos de receita e serviços mais procurados.
- **Agenda** — visão por dia/semana/mês, tabela pesquisável e formulário de agendamento
  (a hora de fim é calculada pela duração do serviço).
- **Clientes** — lista com saldo de sessões em pacote e atalho de WhatsApp; a ficha traz
  histórico de atendimentos, pagamentos e pacotes.
- **Pacotes** — venda de sessões antecipadas: saldo, validade, progresso, receita ainda a
  realizar e registro de sessão consumida.
- **Financeiro** — recebimentos, pendências, inadimplência e registro rápido de pagamento.
- **Estoque** — produtos, valor do inventário, alertas de reposição e movimentações.
- **Relatórios** — indicadores financeiros, de agenda, clientes, pacotes e inventário, com
  exportação em CSV (com BOM, abre certo no Excel pt-BR).
- **Configurações** — dados do espaço e catálogo de serviços por categoria.

## Identidade visual

A paleta foi extraída do logo e das artes do Instagram
[@karolynepaolabeauty](https://instagram.com/karolynepaolabeauty):

| Cor       | Hex       | Uso                                  |
| --------- | --------- | ------------------------------------ |
| Petróleo  | `#12343F` | Texto, sidebar ativa, ações primárias |
| Rosa      | `#C45D79` | Destaques, CTAs, gráficos            |
| Rosa claro| `#F3B9C5` | Preenchimentos decorativos           |
| Turquesa  | `#3E9C9C` | Segunda série de dados               |
| Creme     | `#F7F2EC` | Fundo                                |
| Nude      | `#D9B5A5` | Pétala central do símbolo            |

Tipografia: **Playfair Display** nos títulos, **Inter** no corpo.

A logo usada é o arquivo oficial, `src/assets/logotipo.png`, com o fundo branco removido
(canal alfa). Nada além disso foi alterado nela.

`src/assets/logotipo-simbolo.png` (recorte justo do símbolo) e `public/favicon.png` (o mesmo
símbolo em quadrado, para a aba do navegador) são derivados do arquivo oficial.

O componente `Logo` monta um lockup compacto: o símbolo em imagem + a assinatura redesenhada
em texto (Playfair Display e Inter). É o que a sidebar usa — ocupa pouca altura e acompanha o
tema, coisa que a assinatura em arquivo não faz, já que é cinza-escura e sumiria no modo
escuro. O `FullLogo` usa o arquivo oficial inteiro e fica reservado para o cartão da marca em
Configurações, onde há espaço e ele aparece sobre uma placa clara.

## Tratamento

O sistema se dirige à profissional como **Karol** (`salon.nickname`), editável em
Configurações. O nome completo `salon.owner` e a marca `salon.name` seguem
"Karolyne Paola" — são identidade do negócio, não forma de tratamento.

Os tokens vivem em `@theme` no `src/index.css` (Tailwind 4, configuração CSS-first, sem
`tailwind.config.js`). O modo escuro aplica a classe `dark` no `<html>` e redefine os mesmos
tokens com o petróleo do logo como fundo.

## Estrutura

```
src/
├── App.jsx              # shell: navegação, tema e filtro de período
├── views/               # uma view por módulo
├── components/          # componentes de domínio e de UI
├── data/sampleData.js   # dados de demonstração (datas relativas a hoje)
└── lib/                 # formatação pt-BR/BRL, filtros de data, link de WhatsApp
```
