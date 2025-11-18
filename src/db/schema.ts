import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "VIEWER",
  "OPERATOR",
  "PURCHASER",
  "AUDITOR",
  "ADMINISTRATOR",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  role: userRoleEnum("role").notNull().default("VIEWER"),
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
  "Contabil-Fiscal",
  "Dep.Pessoal",
  "Digitação",
  "Financeiro",
  "HD Externo",
  "Juridico",
  "Lista Operacional",
  "Notas Fiscais",
  "Operacional",
  "Porto Marina Resort",
  "TI",
  "Publico",
]);

export const coresEnum = pgEnum("cores", [
  "Preta",
  "Amarela",
  "Magenta",
  "Azul",
]);

export const materiaisCategoriaEnum = pgEnum("materiais_categoria", [
  "Mouse",
  "Teclado",
  "Monitor",
  "Computador",
  "Nobreak",
  "Camera",
]);

export const solicitacaoCompraStatusEnum = pgEnum("solicitacao_compra_status", [
  "EM_ANDAMENTO",
  "AGUARDANDO_ENTREGA",
  "COMPRADO",
  "CONCLUIDO",
]);

export const pedidoInternoStatusEnum = pgEnum("pedido_interno_status", [
  "AGUARDANDO",
  "ENVIADO",
  "RECEBIDO",
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
  garantia: timestamp("garantia"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  usuarioNome: text("usuario_nome").references(() => usuarioTable.nome),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const monitorTable = pgTable("monitor", {
  id: text("id").primaryKey(),
  marca: text("marca"),
  modelo: text("modelo"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  usuarioNome: text("usuario_nome").references(() => usuarioTable.nome),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tonerTable = pgTable("toner", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  cor: coresEnum("cor"),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  impressoraNome: text("impressora_nome").references(
    () => impressoraTable.nome,
  ),
  estoqueMin: integer("estoque_min").default(0),
  estoqueAtual: integer("estoque_atual").default(0),
  updateUserId: text("update_user_id").references(() => usersTable.id),
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

export const impressorasTonersTable = pgTable("impressoras_toners", {
  id: text("id").primaryKey(),
  impressoraId: text("impressora_id")
    .notNull()
    .references(() => impressoraTable.id, { onDelete: "cascade" }),
  tonerNome: text("toner_nome")
    .notNull()
    .references(() => tonerTable.nome, { onDelete: "cascade" }),
  quantidade: integer("quantidade").default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const camerasUsuariosTable = pgTable("cameras_usuarios", {
  id: text("id").primaryKey(),
  cameraId: text("camera_id")
    .notNull()
    .references(() => camerasTable.id, { onDelete: "cascade" }),
  usuarioNome: text("usuario_nome")
    .notNull()
    .references(() => usuarioTable.nome, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const officeTable = pgTable("office", {
  id: text("id").primaryKey(),
  nomeO365: text("nome_o365").notNull(),
  senha: text("senha"),
  computadorNome: text("computador_nome")
    .notNull()
    .references(() => computadoresTable.nome),
  usuarioNome: text("usuario_nome").references(() => usuarioTable.nome),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const servidorTable = pgTable("servidor", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  memoria: text("memoria"),
  disco1: text("disco1"),
  disco2: text("disco2"),
  disco3: text("disco3"),
  disco4: text("disco4"),
  disco5: text("disco5"),
  vm: boolean("vm").default(false),
  funcao: text("funcao"),
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
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const acessosDepartamentosUsuariosTable = pgTable(
  "acessos_departamentos_usuarios",
  {
    id: text("id").primaryKey(),
    acessoDepartamentoId: text("acesso_departamento_id")
      .notNull()
      .references(() => acessosDepartamentosTable.id, { onDelete: "cascade" }),
    usuarioNome: text("usuario_nome")
      .notNull()
      .references(() => usuarioTable.nome, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

export const materiaisDeTiTable = pgTable("materiais_de_ti", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  categoria: materiaisCategoriaEnum("categoria").notNull(),
  quantidade: integer("quantidade").default(0),
  estoqueMin: integer("estoque_min").default(0),
  estoqueAtual: integer("estoque_atual").default(0),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const solicitacaoCompraTable = pgTable("solicitacao_compra", {
  id: text("id").primaryKey(),
  tipoProduto: text("tipo_produto").notNull().default("MATERIAL_TI"), // "MATERIAL_TI" ou "TONER"
  materialId: text("material_id").references(() => materiaisDeTiTable.id, {
    onDelete: "cascade",
  }),
  tonerId: text("toner_id").references(() => tonerTable.id, {
    onDelete: "cascade",
  }),
  cor: coresEnum("cor"), // Para toner
  quantidade: integer("quantidade").notNull().default(1),
  status: solicitacaoCompraStatusEnum("status")
    .notNull()
    .default("EM_ANDAMENTO"),
  cotacoesNotas: text("cotacoes_notas"),
  cotacaoSelecionadaId: text("cotacao_selecionada_id"),
  recebidoPor: text("recebido_por"),
  dataRecebimento: timestamp("data_recebimento"),
  numeroNotaFiscal: text("numero_nota_fiscal"),
  updateUserId: text("update_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const solicitacaoCompraCotacaoTable = pgTable(
  "solicitacao_compra_cotacao",
  {
    id: text("id").primaryKey(),
    solicitacaoCompraId: text("solicitacao_compra_id")
      .notNull()
      .references(() => solicitacaoCompraTable.id, { onDelete: "cascade" }),
    fornecedorNome: text("fornecedor_nome").notNull(),
    fornecedorCnpj: text("fornecedor_cnpj"),
    produtoDescricao: text("produto_descricao").notNull(),
    valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
    quantidade: integer("quantidade").notNull().default(1),
    prazoEntrega: timestamp("prazo_entrega"),
    updateUserId: text("update_user_id").references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

export const pedidoInternoTable = pgTable("pedido_interno", {
  id: text("id").primaryKey(),
  tipoProduto: text("tipo_produto").notNull(), // "MATERIAL_TI" ou "TONER"
  produtoId: text("produto_id").notNull(), // FK para materiaisDeTiTable.id ou tonerTable.id
  categoria: text("categoria"), // Snapshot da categoria
  quantidade: integer("quantidade").notNull().default(1),
  localidadeNome: text("localidade_nome").references(
    () => localidadeTable.nome,
  ),
  impressoraNome: text("impressora_nome").references(
    () => impressoraTable.nome,
  ),
  cor: coresEnum("cor"),
  status: pedidoInternoStatusEnum("status").notNull().default("AGUARDANDO"),
  enviadoPor: text("enviado_por"),
  dataEnvio: text("data_envio"),
  recebidoPor: text("recebido_por"),
  dataRecebimento: text("data_recebimento"),
  solicitanteId: text("solicitante_id")
    .notNull()
    .references(() => usersTable.id),
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
  materiaisDeTi: many(materiaisDeTiTable),
}));

export const usuarioRelations = relations(usuarioTable, ({ one, many }) => ({
  localidade: one(localidadeTable, {
    fields: [usuarioTable.localidadeNome],
    references: [localidadeTable.nome],
  }),
  computadores: many(computadoresTable),
  monitores: many(monitorTable),
  nobreaks: many(nobreakTable),
  office: many(officeTable),
  cameras: many(camerasUsuariosTable),
  acessosDepartamentos: many(acessosDepartamentosTable),
  acessosDepartamentosUsuarios: many(acessosDepartamentosUsuariosTable),
}));

export const computadoresRelations = relations(
  computadoresTable,
  ({ one, many }) => ({
    localidade: one(localidadeTable, {
      fields: [computadoresTable.localidadeNome],
      references: [localidadeTable.nome],
    }),
    usuario: one(usuarioTable, {
      fields: [computadoresTable.usuarioNome],
      references: [usuarioTable.nome],
    }),
    office: many(officeTable),
    nobreaks: many(nobreakTable),
    acessosDepartamentos: many(acessosDepartamentosTable),
  }),
);

export const monitorRelations = relations(monitorTable, ({ one }) => ({
  localidade: one(localidadeTable, {
    fields: [monitorTable.localidadeNome],
    references: [localidadeTable.nome],
  }),
  usuario: one(usuarioTable, {
    fields: [monitorTable.usuarioNome],
    references: [usuarioTable.nome],
  }),
}));

export const impressoraRelations = relations(
  impressoraTable,
  ({ one, many }) => ({
    localidade: one(localidadeTable, {
      fields: [impressoraTable.localidadeNome],
      references: [localidadeTable.nome],
    }),
    toners: many(impressorasTonersTable),
  }),
);

export const tonerRelations = relations(tonerTable, ({ one, many }) => ({
  localidade: one(localidadeTable, {
    fields: [tonerTable.localidadeNome],
    references: [localidadeTable.nome],
  }),
  impressora: one(impressoraTable, {
    fields: [tonerTable.impressoraNome],
    references: [impressoraTable.nome],
  }),
  impressoras: many(impressorasTonersTable),
}));

export const impressorasTonersRelations = relations(
  impressorasTonersTable,
  ({ one }) => ({
    impressora: one(impressoraTable, {
      fields: [impressorasTonersTable.impressoraId],
      references: [impressoraTable.id],
    }),
    toner: one(tonerTable, {
      fields: [impressorasTonersTable.tonerNome],
      references: [tonerTable.nome],
    }),
  }),
);

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

export const camerasRelations = relations(camerasTable, ({ one, many }) => ({
  localidade: one(localidadeTable, {
    fields: [camerasTable.localidade],
    references: [localidadeTable.nome],
  }),
  nobreak: one(nobreakTable, {
    fields: [camerasTable.nobreakId],
    references: [nobreakTable.id],
  }),
  usuarios: many(camerasUsuariosTable),
}));

export const camerasUsuariosRelations = relations(
  camerasUsuariosTable,
  ({ one }) => ({
    camera: one(camerasTable, {
      fields: [camerasUsuariosTable.cameraId],
      references: [camerasTable.id],
    }),
    usuario: one(usuarioTable, {
      fields: [camerasUsuariosTable.usuarioNome],
      references: [usuarioTable.nome],
    }),
  }),
);

export const officeRelations = relations(officeTable, ({ one }) => ({
  computador: one(computadoresTable, {
    fields: [officeTable.computadorNome],
    references: [computadoresTable.nome],
  }),
  usuario: one(usuarioTable, {
    fields: [officeTable.usuarioNome],
    references: [usuarioTable.nome],
  }),
}));

export const acessosDepartamentosRelations = relations(
  acessosDepartamentosTable,
  ({ one, many }) => ({
    usuario: one(usuarioTable, {
      fields: [acessosDepartamentosTable.usuarioLogin],
      references: [usuarioTable.login],
    }),
    computador: one(computadoresTable, {
      fields: [acessosDepartamentosTable.computadorNome],
      references: [computadoresTable.nome],
    }),
    usuarios: many(acessosDepartamentosUsuariosTable),
  }),
);

export const acessosDepartamentosUsuariosRelations = relations(
  acessosDepartamentosUsuariosTable,
  ({ one }) => ({
    acessoDepartamento: one(acessosDepartamentosTable, {
      fields: [acessosDepartamentosUsuariosTable.acessoDepartamentoId],
      references: [acessosDepartamentosTable.id],
    }),
    usuario: one(usuarioTable, {
      fields: [acessosDepartamentosUsuariosTable.usuarioNome],
      references: [usuarioTable.nome],
    }),
  }),
);

export const materiaisDeTiRelations = relations(
  materiaisDeTiTable,
  ({ one, many }) => ({
    localidade: one(localidadeTable, {
      fields: [materiaisDeTiTable.localidadeNome],
      references: [localidadeTable.nome],
    }),
    solicitacoesCompra: many(solicitacaoCompraTable),
  }),
);

export const solicitacaoCompraRelations = relations(
  solicitacaoCompraTable,
  ({ one, many }) => ({
    material: one(materiaisDeTiTable, {
      fields: [solicitacaoCompraTable.materialId],
      references: [materiaisDeTiTable.id],
    }),
    cotacoes: many(solicitacaoCompraCotacaoTable),
    cotacaoSelecionada: one(solicitacaoCompraCotacaoTable, {
      fields: [solicitacaoCompraTable.cotacaoSelecionadaId],
      references: [solicitacaoCompraCotacaoTable.id],
    }),
    recebidoPorUsuario: one(usersTable, {
      fields: [solicitacaoCompraTable.recebidoPor],
      references: [usersTable.id],
    }),
  }),
);

export const solicitacaoCompraCotacaoRelations = relations(
  solicitacaoCompraCotacaoTable,
  ({ one }) => ({
    solicitacao: one(solicitacaoCompraTable, {
      fields: [solicitacaoCompraCotacaoTable.solicitacaoCompraId],
      references: [solicitacaoCompraTable.id],
    }),
  }),
);

export const logsTable = pgTable("logs", {
  id: text("id").primaryKey(),
  tipo: text("tipo").notNull(), // "solicitacao_compra", "pedido_interno", "material_ti", "toner", etc
  entidadeId: text("entidade_id").notNull(), // ID da entidade que foi alterada
  acao: text("acao").notNull(), // "criado", "atualizado", "deletado", "status_alterado", etc
  descricao: text("descricao"), // Descrição da ação
  dadosAnteriores: text("dados_anteriores"), // JSON com dados anteriores
  dadosNovos: text("dados_novos"), // JSON com dados novos
  updateUserId: text("update_user_id")
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pedidoInternoRelations = relations(
  pedidoInternoTable,
  ({ one }) => ({
    localidade: one(localidadeTable, {
      fields: [pedidoInternoTable.localidadeNome],
      references: [localidadeTable.nome],
    }),
    impressora: one(impressoraTable, {
      fields: [pedidoInternoTable.impressoraNome],
      references: [impressoraTable.nome],
    }),
    solicitante: one(usersTable, {
      fields: [pedidoInternoTable.solicitanteId],
      references: [usersTable.id],
    }),
  }),
);

export const logsRelations = relations(logsTable, ({ one }) => ({
  usuario: one(usersTable, {
    fields: [logsTable.updateUserId],
    references: [usersTable.id],
  }),
}));

export const notificacoesTable = pgTable("notificacoes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(), // "estoque_baixo", "solicitacao_pendente", "pedido_pendente", "sistema"
  titulo: text("titulo").notNull(),
  mensagem: text("mensagem").notNull(),
  link: text("link"), // URL para a página relacionada
  lida: boolean("lida").notNull().default(false),
  prioridade: text("prioridade").notNull().default("normal"), // "baixa", "normal", "alta", "critica"
  entidadeId: text("entidade_id"), // ID da entidade relacionada (opcional)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lidaEm: timestamp("lida_em"),
});

export const notificacoesRelations = relations(
  notificacoesTable,
  ({ one }) => ({
    usuario: one(usersTable, {
      fields: [notificacoesTable.userId],
      references: [usersTable.id],
    }),
  }),
);
