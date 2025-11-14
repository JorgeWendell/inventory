import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const departamentosEnum = pgEnum("departamentos", [
  "Administracao",
  "Compras",
  "DepPessoal",
  "TI",
  "Publico",
]);

export const localidadeTable = pgTable("localidade", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  endereco: text("endereco"),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usuarioTable = pgTable("usuario", {
  id: text("id").primaryKey(),
  login: text("login").notNull().unique(),
  nome: text("nome").notNull().unique(),
  cargo: text("cargo"),
  depto: text("depto"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const monitorTable = pgTable("monitor", {
  id: text("id").primaryKey(),
  marca: text("marca"),
  modelo: text("modelo"),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

export const impressoraTable = pgTable("impressora", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  marca: text("marca"),
  modelo: text("modelo"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  manutencao: boolean("manutencao").default(false),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const camerasTable = pgTable("cameras", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  localidade: text("localidade").references(() => localidadeTable.nome),
  quantidadeCameras: integer("quantidade_cameras").default(1),
  intelbrasId: text("intelbras_id"),
  nobreakId: text("nobreak_id").references(() => nobreakTable.id),
  acesso: text("acesso"),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const officeTable = pgTable("office", {
  id: text("id").primaryKey(),
  nomeO365: text("nome_o365").notNull(),
  senha: text("senha"),
  computadorNome: text("computador_nome")
    .notNull()
    .references(() => computadoresTable.nome),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const localidadeRelations = relations(localidadeTable, ({ many }) => ({
  usuarios: many(usuarioTable),
  computadores: many(computadoresTable),
  impressoras: many(impressoraTable),
  toners: many(tonerTable),
  nobreaks: many(nobreakTable),
  cameras: many(camerasTable),
}));

export const usuarioRelations = relations(usuarioTable, ({ one, many }) => ({
  localidade: one(localidadeTable, {
    fields: [usuarioTable.localidadeNome],
    references: [localidadeTable.nome],
  }),
  nobreaks: many(nobreakTable),
  acessosDepartamentos: many(acessosDepartamentosTable),
}));

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

export const monitorRelations = relations(monitorTable, () => ({}));

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

export const officeRelations = relations(officeTable, ({ one }) => ({
  computador: one(computadoresTable, {
    fields: [officeTable.computadorNome],
    references: [computadoresTable.nome],
  }),
}));

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
