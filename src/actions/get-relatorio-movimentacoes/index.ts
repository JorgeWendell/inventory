"use server";

import { db } from "@/db";
import { logsTable, usersTable } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function getRelatorioMovimentacoes(
  dataInicio?: string,
  dataFim?: string,
) {
  const conditions = [];

  if (dataInicio) {
    conditions.push(gte(logsTable.createdAt, new Date(dataInicio)));
  }

  if (dataFim) {
    const dataFimDate = new Date(dataFim);
    dataFimDate.setHours(23, 59, 59, 999);
    conditions.push(lte(logsTable.createdAt, dataFimDate));
  }

  // Filtrar apenas logs relacionados a estoque
  // Nota: Drizzle não suporta OR direto, então vamos filtrar no código

  const movimentacoes = await db
    .select({
      tipo: logsTable.tipo,
      acao: logsTable.acao,
      descricao: logsTable.descricao,
      dadosAnteriores: logsTable.dadosAnteriores,
      dadosNovos: logsTable.dadosNovos,
      createdAt: logsTable.createdAt,
      userName: usersTable.name,
    })
    .from(logsTable)
    .leftJoin(usersTable, eq(logsTable.updateUserId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(logsTable.createdAt))
    .limit(1000);

  // Filtrar apenas logs relacionados a estoque
  const movimentacoesFiltradas = movimentacoes.filter(
    (mov) => mov.tipo === "Estoque" || mov.tipo === "Material de TI",
  );

  return movimentacoesFiltradas.map((mov) => ({
    tipo: mov.tipo,
    acao: mov.acao,
    descricao: mov.descricao,
    dadosAnteriores: mov.dadosAnteriores
      ? JSON.parse(mov.dadosAnteriores)
      : null,
    dadosNovos: mov.dadosNovos ? JSON.parse(mov.dadosNovos) : null,
    data: mov.createdAt.toISOString().split("T")[0],
    atualizadoPor: mov.userName || "N/A",
  }));
}

