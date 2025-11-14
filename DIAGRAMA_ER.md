## Schema Drizzle ORM

```typescript
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum para Departamentos
export const departamentosEnum = pgEnum("departamentos", [
  "Administracao",
  "Compras",
  "DepPessoal",
  "TI",
  "Publico",
]);

// Tabela Localidade
export const localidadeTable = pgTable("localidade", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  endereco: text("endereco"),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Usuario (Inventário)
export const usuarioTable = pgTable("usuario", {
  id: text("id").primaryKey(),
  login: text("login").notNull().unique(),
  nome: text("nome").notNull().unique(),
  cargo: text("cargo"),
  depto: text("depto"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Computadores
export const computadoresTable = pgTable("computadores", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  marca: text("marca"),
  modelo: text("modelo"),
  processador: text("processador"),
  memoria: text("memoria"),
  disco: text("disco"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Monitor
export const monitorTable = pgTable("monitor", {
  id: text("id").primaryKey(),
  marca: text("marca"),
  modelo: text("modelo"),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Toner
export const tonerTable = pgTable("toner", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  impressoraNome: text("impressora_nome").references(
    () => impressoraTable.nome,
  ),
  estoqueMin: integer("estoque_min").default(0),
  estoqueAtual: integer("estoque_atual").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Impressora
export const impressoraTable = pgTable("impressora", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  marca: text("marca"),
  modelo: text("modelo"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  manutencao: boolean("manutencao").default(false),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Nobreak
export const nobreakTable = pgTable("nobreak", {
  id: text("id").primaryKey(),
  marca: text("marca"),
  modelo: text("modelo"),
  capacidade: text("capacidade"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  usuarioNome: text("usuario_nome").references(() => usuarioTable.nome),
  computadoresNome: text("computadores_nome").references(
    () => computadoresTable.nome,
  ),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Cameras
export const camerasTable = pgTable("cameras", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  localidade: text("localidade").references(() => localidadeTable.nome),
  quantidadeCameras: integer("quantidade_cameras").default(1),
  intelbrasId: text("intelbras_id"),
  nobreakId: text("nobreak_id").references(() => nobreakTable.id),
  acesso: text("acesso"),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Office
export const officeTable = pgTable("office", {
  id: text("id").primaryKey(),
  nomeO365: text("nome_o365").notNull(),
  senha: text("senha"),
  computadorNome: text("computador_nome")
    .notNull()
    .references(() => computadoresTable.nome),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Acessos Departamentos
export const acessosDepartamentosTable = pgTable("acessos_departamentos", {
  id: text("id").primaryKey(),
  usuarioLogin: text("usuario_login")
    .notNull()
    .references(() => usuarioTable.login),
  computadorNome: text("computador_nome")
    .notNull()
    .references(() => computadoresTable.nome),
  pastaDepartamentos: departamentosEnum("pasta_departamentos").notNull(),
  acesso: boolean("acesso").default(true),
  updateUser: text("update_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Definições de Relações (Relations)
// ============================================

// Relações da Localidade
export const localidadeRelations = relations(localidadeTable, ({ many }) => ({
  usuarios: many(usuarioTable),
  computadores: many(computadoresTable),
  impressoras: many(impressoraTable),
  toners: many(tonerTable),
  nobreaks: many(nobreakTable),
  cameras: many(camerasTable),
}));

// Relações do Usuario
export const usuarioRelations = relations(usuarioTable, ({ one, many }) => ({
  localidade: one(localidadeTable, {
    fields: [usuarioTable.localidadeNome],
    references: [localidadeTable.nome],
  }),
  nobreaks: many(nobreakTable),
  acessosDepartamentos: many(acessosDepartamentosTable),
}));

// Relações dos Computadores
export const computadoresRelations = relations(
  computadoresTable,
  ({ one, many }) => ({
    localidade: one(localidadeTable, {
      fields: [computadoresTable.localidadeNome],
      references: [localidadeTable.nome],
    }),
    office: many(officeTable),
    nobreaks: many(nobreakTable),
    acessosDepartamentos: many(acessosDepartamentosTable),
  }),
);

// Relações do Monitor
export const monitorRelations = relations(monitorTable, ({ one }) => ({
  // Monitor não tem FK para Computador na estrutura original
  // Se necessário, adicionar relacionamento aqui
}));

// Relações da Impressora
export const impressoraRelations = relations(
  impressoraTable,
  ({ one, many }) => ({
    localidade: one(localidadeTable, {
      fields: [impressoraTable.localidadeNome],
      references: [localidadeTable.nome],
    }),
    toners: many(tonerTable),
  }),
);

// Relações do Toner
export const tonerRelations = relations(tonerTable, ({ one }) => ({
  localidade: one(localidadeTable, {
    fields: [tonerTable.localidadeNome],
    references: [localidadeTable.nome],
  }),
  impressora: one(impressoraTable, {
    fields: [tonerTable.impressoraNome],
    references: [impressoraTable.nome],
  }),
}));

// Relações do Nobreak
export const nobreakRelations = relations(nobreakTable, ({ one, many }) => ({
  localidade: one(localidadeTable, {
    fields: [nobreakTable.localidadeNome],
    references: [localidadeTable.nome],
  }),
  usuario: one(usuarioTable, {
    fields: [nobreakTable.usuarioNome],
    references: [usuarioTable.nome],
  }),
  computador: one(computadoresTable, {
    fields: [nobreakTable.computadoresNome],
    references: [computadoresTable.nome],
  }),
  cameras: many(camerasTable),
}));

// Relações das Cameras
export const camerasRelations = relations(camerasTable, ({ one }) => ({
  localidade: one(localidadeTable, {
    fields: [camerasTable.localidade],
    references: [localidadeTable.nome],
  }),
  nobreak: one(nobreakTable, {
    fields: [camerasTable.nobreakId],
    references: [nobreakTable.id],
  }),
}));

// Relações do Office
export const officeRelations = relations(officeTable, ({ one }) => ({
  computador: one(computadoresTable, {
    fields: [officeTable.computadorNome],
    references: [computadoresTable.nome],
  }),
}));

// Relações dos Acessos Departamentos
export const acessosDepartamentosRelations = relations(
  acessosDepartamentosTable,
  ({ one }) => ({
    usuario: one(usuarioTable, {
      fields: [acessosDepartamentosTable.usuarioLogin],
      references: [usuarioTable.login],
    }),
    computador: one(computadoresTable, {
      fields: [acessosDepartamentosTable.computadorNome],
      references: [computadoresTable.nome],
    }),
  }),
);
```

### Observações sobre o Schema

1. **Chaves Primárias**: Todas as tabelas usam `id` como chave primária do tipo `text`.

2. **Chaves Estrangeiras**:
   - Relacionamentos são feitos através de `references()` apontando para as tabelas relacionadas
   - Alguns relacionamentos usam `nome` como FK (ex: `localidadeNome`, `computadorNome`) para facilitar consultas
   - **Importante**: Para que as FKs usando `nome` funcionem, os campos `nome` nas tabelas referenciadas devem ser `unique()`

3. **Enum**: O enum `departamentosEnum` define os valores possíveis para a coluna `pastaDepartamentos` na tabela `acessosDepartamentosTable`.

4. **Relacionamento Impressora-Toner (1:N)**: Uma impressora pode ter vários toners, mas cada toner pertence a apenas uma impressora. O relacionamento é feito através do campo `impressoraNome` na tabela `tonerTable`, que referencia `impressoraTable.nome`.

5. **Monitor**: Não possui FK para Computador conforme a estrutura original. Se necessário relacionar Monitor com Computador, pode ser feito através de uma tabela de relacionamento ou adicionando FK posteriormente.

6. **Timestamps**: Todas as tabelas incluem `createdAt` e `updatedAt` para auditoria, seguindo o padrão do schema existente.

7. **Campos Opcionais**: Campos que podem ser nulos não têm `.notNull()`, permitindo valores opcionais.

8. **Valores Padrão**:
   - Campos booleanos têm valores padrão (`false` para `manutencao`, `true` para `acesso`)
   - Campos numéricos têm valores padrão (0 para estoques, 1 para quantidade de câmeras)
   - Timestamps têm `.defaultNow()` para preenchimento automático

### Análise dos Relacionamentos

✅ **Relacionamentos Corretos**:

- `usuarioTable.localidadeNome` → `localidadeTable.nome` ✓
- `computadoresTable.localidadeNome` → `localidadeTable.nome` ✓
- `tonerTable.localidadeNome` → `localidadeTable.nome` ✓
- `impressoraTable.localidadeNome` → `localidadeTable.nome` ✓
- `nobreakTable.localidadeNome` → `localidadeTable.nome` ✓
- `nobreakTable.usuarioNome` → `usuarioTable.nome` ✓
- `nobreakTable.computadoresNome` → `computadoresTable.nome` ✓
- `camerasTable.localidade` → `localidadeTable.nome` ✓
- `camerasTable.nobreakId` → `nobreakTable.id` ✓
- `officeTable.computadorNome` → `computadoresTable.nome` ✓
- `acessosDepartamentosTable.usuarioLogin` → `usuarioTable.login` ✓
- `acessosDepartamentosTable.computadorNome` → `computadoresTable.nome` ✓
- `tonerTable.impressoraNome` → `impressoraTable.nome` ✓ (1:N - uma impressora tem vários toners)

✅ **Todos os campos usados como FK agora possuem `.unique()`**:

- `localidadeTable.nome` é `unique()` ✓
- `computadoresTable.nome` é `unique()` ✓
- `usuarioTable.login` é `unique()` ✓
- `usuarioTable.nome` é `unique()` ✓
- `impressoraTable.nome` é `unique()` ✓
- `tonerTable.nome` é `unique()` ✓

**Nota sobre Impressora-Toner**: Relacionamento 1:N (um para muitos):

- 1 Impressora pode ter vários Toners
- 1 Toner pertence a apenas 1 Impressora
- O relacionamento é feito através do campo `impressoraNome` na tabela `tonerTable`
