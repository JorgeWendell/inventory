"use server";

import { db } from "@/db";
import {
  computadoresTable,
  materiaisDeTiTable,
  monitorTable,
  nobreakTable,
  pedidoInternoTable,
  solicitacaoCompraTable,
  tonerTable,
} from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

export async function getDashboardStats() {
  // Estatísticas de materiais de TI por categoria
  const materiaisPorCategoria = await db
    .select({
      categoria: materiaisDeTiTable.categoria,
      total: sql<number>`count(*)::int`.as("total"),
      estoqueBaixo: sql<number>`count(*) filter (where ${materiaisDeTiTable.estoqueAtual} <= ${materiaisDeTiTable.estoqueMin})::int`.as("estoqueBaixo"),
    })
    .from(materiaisDeTiTable)
    .groupBy(materiaisDeTiTable.categoria);

  // Total de itens por tipo
  const [totalComputadores] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(computadoresTable);

  const [totalMonitores] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(monitorTable);

  const [totalNobreaks] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(nobreakTable);

  const [totalToners] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tonerTable);

  const [totalMateriais] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(materiaisDeTiTable);

  // Estoque baixo (materiais com estoque atual <= estoque mínimo)
  const estoquesBaixos = await db
    .select({
      id: materiaisDeTiTable.id,
      nome: materiaisDeTiTable.nome,
      categoria: materiaisDeTiTable.categoria,
      estoqueAtual: materiaisDeTiTable.estoqueAtual,
      estoqueMin: materiaisDeTiTable.estoqueMin,
      localidadeNome: materiaisDeTiTable.localidadeNome,
    })
    .from(materiaisDeTiTable)
    .where(
      and(
        sql`${materiaisDeTiTable.estoqueAtual} <= ${materiaisDeTiTable.estoqueMin}`,
        sql`${materiaisDeTiTable.estoqueMin} > 0`,
      ),
    )
    .limit(10);

  // Solicitações de compra por status
  const solicitacoesPorStatus = await db
    .select({
      status: solicitacaoCompraTable.status,
      total: sql<number>`count(*)::int`.as("total"),
    })
    .from(solicitacaoCompraTable)
    .groupBy(solicitacaoCompraTable.status);

  // Solicitações pendentes (EM_ANDAMENTO ou AGUARDANDO_ENTREGA)
  const solicitacoesPendentes = await db
    .select({
      id: solicitacaoCompraTable.id,
      tipoProduto: solicitacaoCompraTable.tipoProduto,
      quantidade: solicitacaoCompraTable.quantidade,
      status: solicitacaoCompraTable.status,
      createdAt: solicitacaoCompraTable.createdAt,
    })
    .from(solicitacaoCompraTable)
    .where(
      inArray(solicitacaoCompraTable.status, [
        "EM_ANDAMENTO",
        "AGUARDANDO_ENTREGA",
      ]),
    )
    .orderBy(solicitacaoCompraTable.createdAt)
    .limit(10);

  // Pedidos internos por status
  const pedidosPorStatus = await db
    .select({
      status: pedidoInternoTable.status,
      total: sql<number>`count(*)::int`.as("total"),
    })
    .from(pedidoInternoTable)
    .groupBy(pedidoInternoTable.status);

  // Pedidos internos pendentes (AGUARDANDO)
  const pedidosPendentes = await db
    .select({
      id: pedidoInternoTable.id,
      tipoProduto: pedidoInternoTable.tipoProduto,
      quantidade: pedidoInternoTable.quantidade,
      status: pedidoInternoTable.status,
      createdAt: pedidoInternoTable.createdAt,
    })
    .from(pedidoInternoTable)
    .where(eq(pedidoInternoTable.status, "AGUARDANDO"))
    .orderBy(pedidoInternoTable.createdAt)
    .limit(10);

  // Itens por localidade (materiais de TI)
  const itensPorLocalidade = await db
    .select({
      localidade: materiaisDeTiTable.localidadeNome,
      total: sql<number>`count(*)::int`.as("total"),
    })
    .from(materiaisDeTiTable)
    .where(sql`${materiaisDeTiTable.localidadeNome} IS NOT NULL`)
    .groupBy(materiaisDeTiTable.localidadeNome)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  return {
    materiaisPorCategoria: materiaisPorCategoria.map((item) => ({
      categoria: item.categoria || "-",
      total: Number(item.total),
      estoqueBaixo: Number(item.estoqueBaixo),
    })),
    totais: {
      computadores: Number(totalComputadores?.count || 0),
      monitores: Number(totalMonitores?.count || 0),
      nobreaks: Number(totalNobreaks?.count || 0),
      toners: Number(totalToners?.count || 0),
      materiais: Number(totalMateriais?.count || 0),
    },
    estoquesBaixos: estoquesBaixos.map((item) => ({
      id: item.id,
      nome: item.nome,
      categoria: item.categoria || "-",
      estoqueAtual: Number(item.estoqueAtual || 0),
      estoqueMin: Number(item.estoqueMin || 0),
      localidade: item.localidadeNome || "-",
    })),
    solicitacoesPorStatus: solicitacoesPorStatus.map((item) => ({
      status: item.status,
      total: Number(item.total),
    })),
    solicitacoesPendentes: solicitacoesPendentes.map((item) => ({
      id: item.id,
      tipoProduto: item.tipoProduto,
      quantidade: Number(item.quantidade),
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    })),
    pedidosPorStatus: pedidosPorStatus.map((item) => ({
      status: item.status,
      total: Number(item.total),
    })),
    pedidosPendentes: pedidosPendentes.map((item) => ({
      id: item.id,
      tipoProduto: item.tipoProduto,
      quantidade: Number(item.quantidade),
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    })),
    itensPorLocalidade: itensPorLocalidade.map((item) => ({
      localidade: item.localidade || "-",
      total: Number(item.total),
    })),
  };
}

