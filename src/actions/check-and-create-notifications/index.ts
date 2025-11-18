"use server";

import { db } from "@/db";
import {
  materiaisDeTiTable,
  solicitacaoCompraTable,
  pedidoInternoTable,
  usersTable,
  notificacoesTable,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { createNotificacao } from "@/actions/create-notificacao";

// Verifica estoques baixos e cria notificações
export async function checkEstoquesBaixos() {
  const estoquesBaixos = await db
    .select({
      id: materiaisDeTiTable.id,
      nome: materiaisDeTiTable.nome,
      categoria: materiaisDeTiTable.categoria,
      estoqueAtual: materiaisDeTiTable.estoqueAtual,
      estoqueMin: materiaisDeTiTable.estoqueMin,
    })
    .from(materiaisDeTiTable)
    .where(
      and(
        sql`${materiaisDeTiTable.estoqueAtual} <= ${materiaisDeTiTable.estoqueMin}`,
        sql`${materiaisDeTiTable.estoqueMin} > 0`,
      ),
    );

  // Buscar todos os usuários (no futuro, filtrar por permissões)
  const usuarios = await db.select().from(usersTable);

  // Criar notificações para cada usuário sobre cada estoque baixo
  for (const usuario of usuarios) {
    for (const estoque of estoquesBaixos) {
      // Verificar se já existe notificação não lida para este estoque
      const notificacaoExistente = await db
        .select()
        .from(notificacoesTable)
        .where(
          and(
            eq(notificacoesTable.userId, usuario.id),
            eq(notificacoesTable.tipo, "estoque_baixo"),
            eq(notificacoesTable.entidadeId, estoque.id),
            eq(notificacoesTable.lida, false),
          ),
        )
        .limit(1);

      if (notificacaoExistente.length === 0) {
        await createNotificacao({
          userId: usuario.id,
          tipo: "estoque_baixo",
          titulo: "Estoque Baixo",
          mensagem: `${estoque.nome} (${estoque.categoria}) está com estoque baixo: ${estoque.estoqueAtual} / ${estoque.estoqueMin}`,
          link: "/estoque/materiais-de-ti",
          prioridade: estoque.estoqueAtual === 0 ? "critica" : "alta",
          entidadeId: estoque.id,
        });
      }
    }
  }
}

// Verifica solicitações pendentes há muito tempo
export async function checkSolicitacoesPendentes() {
  const doisDiasAtras = new Date();
  doisDiasAtras.setDate(doisDiasAtras.getDate() - 2);

  const solicitacoesPendentes = await db
    .select({
      id: solicitacaoCompraTable.id,
      createdAt: solicitacaoCompraTable.createdAt,
    })
    .from(solicitacaoCompraTable)
    .where(
      and(
        sql`${solicitacaoCompraTable.status} IN ('EM_ANDAMENTO', 'AGUARDANDO_ENTREGA')`,
        sql`${solicitacaoCompraTable.createdAt} < ${doisDiasAtras}`,
      ),
    );

  const usuarios = await db.select().from(usersTable);

  for (const usuario of usuarios) {
    for (const solicitacao of solicitacoesPendentes) {
      // Verificar se já existe notificação não lida
      const notificacaoExistente = await db
        .select()
        .from(notificacoesTable)
        .where(
          and(
            eq(notificacoesTable.userId, usuario.id),
            eq(notificacoesTable.tipo, "solicitacao_pendente"),
            eq(notificacoesTable.entidadeId, solicitacao.id),
            eq(notificacoesTable.lida, false),
          ),
        )
        .limit(1);

      if (notificacaoExistente.length === 0) {
        await createNotificacao({
          userId: usuario.id,
          tipo: "solicitacao_pendente",
          titulo: "Solicitação Pendente",
          mensagem: "Uma solicitação de compra está pendente há mais de 2 dias",
          link: "/solicitacoes/solicitacao-de-compra",
          prioridade: "normal",
          entidadeId: solicitacao.id,
        });
      }
    }
  }
}

// Verifica pedidos internos pendentes há muito tempo
export async function checkPedidosPendentes() {
  const umDiaAtras = new Date();
  umDiaAtras.setDate(umDiaAtras.getDate() - 1);

  const pedidosPendentes = await db
    .select({
      id: pedidoInternoTable.id,
      createdAt: pedidoInternoTable.createdAt,
    })
    .from(pedidoInternoTable)
    .where(
      and(
        eq(pedidoInternoTable.status, "AGUARDANDO"),
        sql`${pedidoInternoTable.createdAt} < ${umDiaAtras}`,
      ),
    );

  const usuarios = await db.select().from(usersTable);

  for (const usuario of usuarios) {
    for (const pedido of pedidosPendentes) {
      // Verificar se já existe notificação não lida
      const notificacaoExistente = await db
        .select()
        .from(notificacoesTable)
        .where(
          and(
            eq(notificacoesTable.userId, usuario.id),
            eq(notificacoesTable.tipo, "pedido_pendente"),
            eq(notificacoesTable.entidadeId, pedido.id),
            eq(notificacoesTable.lida, false),
          ),
        )
        .limit(1);

      if (notificacaoExistente.length === 0) {
        await createNotificacao({
          userId: usuario.id,
          tipo: "pedido_pendente",
          titulo: "Pedido Interno Pendente",
          mensagem: "Um pedido interno está aguardando há mais de 1 dia",
          link: "/solicitacoes/pedido-interno",
          prioridade: "normal",
          entidadeId: pedido.id,
        });
      }
    }
  }
}

// Função principal para verificar e criar todas as notificações
export async function checkAndCreateNotifications() {
  try {
    await Promise.all([
      checkEstoquesBaixos(),
      checkSolicitacoesPendentes(),
      checkPedidosPendentes(),
    ]);
  } catch (error) {
    console.error("Erro ao verificar notificações:", error);
  }
}

