"use server";

import { db } from "@/db";
import { notificacoesTable } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";

export async function getNotificacoes(userId: string, apenasNaoLidas = false) {
  const notificacoes = await db
    .select()
    .from(notificacoesTable)
    .where(
      apenasNaoLidas
        ? and(
            eq(notificacoesTable.userId, userId),
            eq(notificacoesTable.lida, false),
          )
        : eq(notificacoesTable.userId, userId),
    )
    .orderBy(desc(notificacoesTable.createdAt));

  return notificacoes.map((notif) => ({
    id: notif.id,
    tipo: notif.tipo,
    titulo: notif.titulo,
    mensagem: notif.mensagem,
    link: notif.link,
    lida: notif.lida,
    prioridade: notif.prioridade,
    entidadeId: notif.entidadeId,
    createdAt: notif.createdAt.toISOString(),
    lidaEm: notif.lidaEm?.toISOString() || null,
  }));
}

