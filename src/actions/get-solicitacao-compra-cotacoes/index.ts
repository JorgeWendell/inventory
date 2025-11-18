"use server";

import { db } from "@/db";
import {
  solicitacaoCompraCotacaoTable,
  usersTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSolicitacaoCompraCotacoes(
  solicitacaoCompraId: string,
) {
  const cotacoes = await db
    .select({
      id: solicitacaoCompraCotacaoTable.id,
      fornecedorNome: solicitacaoCompraCotacaoTable.fornecedorNome,
      fornecedorCnpj: solicitacaoCompraCotacaoTable.fornecedorCnpj,
      produtoDescricao: solicitacaoCompraCotacaoTable.produtoDescricao,
      valor: solicitacaoCompraCotacaoTable.valor,
      quantidade: solicitacaoCompraCotacaoTable.quantidade,
      prazoEntrega: solicitacaoCompraCotacaoTable.prazoEntrega,
      updateUserEmail: usersTable.email,
    })
    .from(solicitacaoCompraCotacaoTable)
    .where(
      eq(
        solicitacaoCompraCotacaoTable.solicitacaoCompraId,
        solicitacaoCompraId,
      ),
    )
    .leftJoin(
      usersTable,
      eq(solicitacaoCompraCotacaoTable.updateUserId, usersTable.id),
    )
    .orderBy(solicitacaoCompraCotacaoTable.createdAt);

  return cotacoes.map((cotacao) => ({
    ...cotacao,
    valor: Number(cotacao.valor),
    prazoEntrega: cotacao.prazoEntrega?.toISOString() ?? null,
    editadoPor: cotacao.updateUserEmail || "-",
  }));
}


