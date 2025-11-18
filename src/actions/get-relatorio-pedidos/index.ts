"use server";

import { db } from "@/db";
import { pedidoInternoTable, usersTable } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function getRelatorioPedidos(
  dataInicio?: string,
  dataFim?: string,
  status?: string,
) {
  const conditions = [];

  if (dataInicio) {
    conditions.push(gte(pedidoInternoTable.createdAt, new Date(dataInicio)));
  }

  if (dataFim) {
    const dataFimDate = new Date(dataFim);
    dataFimDate.setHours(23, 59, 59, 999);
    conditions.push(lte(pedidoInternoTable.createdAt, dataFimDate));
  }

  if (status) {
    const validStatus = status as "AGUARDANDO" | "ENVIADO" | "RECEBIDO";
    conditions.push(eq(pedidoInternoTable.status, validStatus));
  }

  const pedidos = await db
    .select({
      tipoProduto: pedidoInternoTable.tipoProduto,
      produtoId: pedidoInternoTable.produtoId,
      categoria: pedidoInternoTable.categoria,
      quantidade: pedidoInternoTable.quantidade,
      localidadeNome: pedidoInternoTable.localidadeNome,
      impressoraNome: pedidoInternoTable.impressoraNome,
      cor: pedidoInternoTable.cor,
      status: pedidoInternoTable.status,
      enviadoPor: pedidoInternoTable.enviadoPor,
      dataEnvio: pedidoInternoTable.dataEnvio,
      recebidoPor: pedidoInternoTable.recebidoPor,
      dataRecebimento: pedidoInternoTable.dataRecebimento,
      createdAt: pedidoInternoTable.createdAt,
      solicitanteNome: usersTable.name,
    })
    .from(pedidoInternoTable)
    .leftJoin(usersTable, eq(pedidoInternoTable.solicitanteId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(pedidoInternoTable.createdAt))
    .limit(1000);

  return pedidos.map((ped) => ({
    tipoProduto: ped.tipoProduto,
    categoria: ped.categoria,
    quantidade: ped.quantidade,
    localidade: ped.localidadeNome || "N/A",
    impressora: ped.impressoraNome || "N/A",
    cor: ped.cor || "N/A",
    status: ped.status,
    enviadoPor: ped.enviadoPor || "N/A",
    dataEnvio: ped.dataEnvio || "N/A",
    recebidoPor: ped.recebidoPor || "N/A",
    dataRecebimento: ped.dataRecebimento || "N/A",
    data: ped.createdAt.toISOString().split("T")[0],
    solicitante: ped.solicitanteNome || "N/A",
  }));
}

