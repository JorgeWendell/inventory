"use server";

import { db } from "@/db";
import {
  materiaisDeTiTable,
  solicitacaoCompraCotacaoTable,
  solicitacaoCompraTable,
  tonerTable,
  usersTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSolicitacoesCompraTable() {
  const solicitacoes = await db
    .select({
      id: solicitacaoCompraTable.id,
      tipoProduto: solicitacaoCompraTable.tipoProduto,
      quantidade: solicitacaoCompraTable.quantidade,
      status: solicitacaoCompraTable.status,
      cotacoesNotas: solicitacaoCompraTable.cotacoesNotas,
      materialId: solicitacaoCompraTable.materialId,
      tonerId: solicitacaoCompraTable.tonerId,
      cor: solicitacaoCompraTable.cor,
      cotacaoSelecionadaId: solicitacaoCompraTable.cotacaoSelecionadaId,
      recebidoPor: solicitacaoCompraTable.recebidoPor,
      dataRecebimento: solicitacaoCompraTable.dataRecebimento,
      numeroNotaFiscal: solicitacaoCompraTable.numeroNotaFiscal,
      fornecedorSelecionadoNome: solicitacaoCompraCotacaoTable.fornecedorNome,
      updateUserEmail: usersTable.email,
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
    .orderBy(solicitacaoCompraTable.createdAt);

  const solicitacoesComProduto = await Promise.all(
    solicitacoes.map(async (solicitacao) => {
      let material = null;

      if (solicitacao.tipoProduto === "MATERIAL_TI" && solicitacao.materialId) {
        const materialData = await db
          .select({
            id: materiaisDeTiTable.id,
            nome: materiaisDeTiTable.nome,
            categoria: materiaisDeTiTable.categoria,
            estoqueMin: materiaisDeTiTable.estoqueMin,
            estoqueAtual: materiaisDeTiTable.estoqueAtual,
            localidade: materiaisDeTiTable.localidadeNome,
          })
          .from(materiaisDeTiTable)
          .where(eq(materiaisDeTiTable.id, solicitacao.materialId))
          .limit(1);

        if (materialData.length > 0) {
          material = {
            id: materialData[0].id,
            nome: materialData[0].nome,
            categoria: materialData[0].categoria || "-",
            estoqueMin: materialData[0].estoqueMin ?? 0,
            estoqueAtual: materialData[0].estoqueAtual ?? 0,
            localidade: materialData[0].localidade || "-",
          };
        }
      } else if (solicitacao.tipoProduto === "TONER" && solicitacao.tonerId) {
        const tonerData = await db
          .select({
            id: tonerTable.id,
            nome: tonerTable.nome,
            cor: tonerTable.cor,
            estoqueAtual: tonerTable.estoqueAtual,
            localidade: tonerTable.localidadeNome,
          })
          .from(tonerTable)
          .where(eq(tonerTable.id, solicitacao.tonerId))
          .limit(1);

        if (tonerData.length > 0) {
          material = {
            id: tonerData[0].id,
            nome: tonerData[0].nome,
            categoria: "Toner",
            estoqueMin: 0,
            estoqueAtual: tonerData[0].estoqueAtual ?? 0,
            localidade: tonerData[0].localidade || "-",
          };
        }
      }

      return {
        id: solicitacao.id,
        quantidade: solicitacao.quantidade,
        status: solicitacao.status,
        cotacoesNotas: solicitacao.cotacoesNotas || "",
        cotacaoSelecionada: solicitacao.cotacaoSelecionadaId
          ? {
              id: solicitacao.cotacaoSelecionadaId,
              fornecedorNome: solicitacao.fornecedorSelecionadoNome || "-",
            }
          : null,
        material: material || {
          id: "",
          nome: "-",
          categoria: "-",
          estoqueMin: 0,
          estoqueAtual: 0,
          localidade: "-",
        },
        recebidoPor: solicitacao.recebidoPor || null,
        dataRecebimento: solicitacao.dataRecebimento
          ? solicitacao.dataRecebimento.toISOString()
          : null,
        numeroNotaFiscal: solicitacao.numeroNotaFiscal || null,
        editadoPor: solicitacao.updateUserEmail || "-",
      };
    }),
  );

  return solicitacoesComProduto;
}


