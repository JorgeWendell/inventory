"use server";

import { db } from "@/db";
import { logsTable, usersTable } from "@/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";

export async function getLogsTable(searchTerm?: string) {
  const query = db
    .select({
      id: logsTable.id,
      tipo: logsTable.tipo,
      entidadeId: logsTable.entidadeId,
      acao: logsTable.acao,
      descricao: logsTable.descricao,
      dadosAnteriores: logsTable.dadosAnteriores,
      dadosNovos: logsTable.dadosNovos,
      usuarioNome: usersTable.name,
      usuarioEmail: usersTable.email,
      createdAt: logsTable.createdAt,
    })
    .from(logsTable)
    .leftJoin(usersTable, eq(logsTable.updateUserId, usersTable.id));

  if (searchTerm && searchTerm.trim() !== "") {
    query.where(
      or(
        ilike(usersTable.name, `%${searchTerm}%`),
        ilike(usersTable.email, `%${searchTerm}%`),
      ),
    );
  }

  const logs = await query.orderBy(desc(logsTable.createdAt));

  return logs.map((log) => ({
    id: log.id,
    tipo: log.tipo,
    entidadeId: log.entidadeId,
    acao: log.acao,
    descricao: log.descricao || "-",
    dadosAnteriores: log.dadosAnteriores
      ? JSON.parse(log.dadosAnteriores)
      : null,
    dadosNovos: log.dadosNovos ? JSON.parse(log.dadosNovos) : null,
    usuario: log.usuarioNome || log.usuarioEmail || "-",
    createdAt: log.createdAt.toISOString(),
  }));
}

