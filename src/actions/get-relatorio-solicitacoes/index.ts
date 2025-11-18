"use server";

import { db } from "@/db";
import {
  solicitacaoCompraTable,
  solicitacaoCompraCotacaoTable,
  usersTable,
  materiaisDeTiTable,
  tonerTable,
} from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function getRelatorioSolicitacoes(
  dataInicio?: string,
  dataFim?: string,
  status?: string,
) {
  const conditions = [];

  if (dataInicio) {
    conditions.push(gte(solicitacaoCompraTable.createdAt, new Date(dataInicio)));
  }

  if (dataFim) {
    const dataFimDate = new Date(dataFim);
    dataFimDate.setHours(23, 59, 59, 999);
    conditions.push(lte(solicitacaoCompraTable.createdAt, dataFimDate));
  }

  if (status) {
    const validStatus = status as
      | "EM_ANDAMENTO"
      | "AGUARDANDO_ENTREGA"
      | "COMPRADO"
      | "CONCLUIDO";
    conditions.push(eq(solicitacaoCompraTable.status, validStatus));
  }

  const solicitacoes = await db
    .select({
      id: solicitacaoCompraTable.id,
      tipoProduto: solicitacaoCompraTable.tipoProduto,
      materialId: solicitacaoCompraTable.materialId,
      tonerId: solicitacaoCompraTable.tonerId,
      quantidade: solicitacaoCompraTable.quantidade,
      status: solicitacaoCompraTable.status,
      cotacaoSelecionadaId: solicitacaoCompraTable.cotacaoSelecionadaId,
      fornecedorSelecionadoNome: solicitacaoCompraCotacaoTable.fornecedorNome,
      recebidoPor: solicitacaoCompraTable.recebidoPor,
      dataRecebimento: solicitacaoCompraTable.dataRecebimento,
      numeroNotaFiscal: solicitacaoCompraTable.numeroNotaFiscal,
      createdAt: solicitacaoCompraTable.createdAt,
      userName: usersTable.name,
    })
    .from(solicitacaoCompraTable)
    .leftJoin(
      solicitacaoCompraCotacaoTable,
      eq(
        solicitacaoCompraCotacaoTable.id,
        solicitacaoCompraTable.cotacaoSelecionadaId,
      ),
    )
    .leftJoin(usersTable, eq(solicitacaoCompraTable.updateUserId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(solicitacaoCompraTable.createdAt))
    .limit(1000);

  // Buscar informações dos produtos e cotações
  const solicitacoesCompletas = await Promise.all(
    solicitacoes.map(async (sol) => {
      let produtoNome = "N/A";
      let categoria = "N/A";

      if (sol.tipoProduto === "MATERIAL_TI" && sol.materialId) {
        const material = await db
          .select({
            nome: materiaisDeTiTable.nome,
            categoria: materiaisDeTiTable.categoria,
          })
          .from(materiaisDeTiTable)
          .where(eq(materiaisDeTiTable.id, sol.materialId))
          .limit(1);

        if (material[0]) {
          produtoNome = material[0].nome;
          categoria = material[0].categoria;
        }
      } else if (sol.tipoProduto === "TONER" && sol.tonerId) {
        const toner = await db
          .select({
            nome: tonerTable.nome,
          })
          .from(tonerTable)
          .where(eq(tonerTable.id, sol.tonerId))
          .limit(1);

        if (toner[0]) {
          produtoNome = toner[0].nome;
          categoria = "Toner";
        }
      }

      // Buscar cotações (precisamos do id para buscar as cotações)
      const cotacoes = await db
        .select()
        .from(solicitacaoCompraCotacaoTable)
        .where(eq(solicitacaoCompraCotacaoTable.solicitacaoCompraId, sol.id));

      return {
        tipoProduto: sol.tipoProduto,
        produtoNome,
        categoria,
        quantidade: sol.quantidade,
        status: sol.status,
        fornecedorSelecionado: sol.fornecedorSelecionadoNome || "N/A",
        recebidoPor: sol.recebidoPor || "N/A",
        dataRecebimento: sol.dataRecebimento?.toISOString().split("T")[0] || "N/A",
        numeroNotaFiscal: sol.numeroNotaFiscal || "N/A",
        data: sol.createdAt.toISOString().split("T")[0],
        atualizadoPor: sol.userName || "N/A",
        cotacoes: cotacoes.map((cot) => ({
          nomeFornecedor: cot.fornecedorNome,
          cnpj: cot.fornecedorCnpj || "N/A",
          valor: cot.valor,
          quantidade: cot.quantidade,
          prazoEntrega: cot.prazoEntrega?.toISOString().split("T")[0] || "N/A",
        })),
      };
    }),
  );

  return solicitacoesCompletas;
}

