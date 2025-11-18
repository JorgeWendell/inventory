"use server";

import { db } from "@/db";
import { notificacoesTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function marcarNotificacaoLida(
  notificacaoId: string,
  userId: string,
) {
  await db
    .update(notificacoesTable)
    .set({
      lida: true,
      lidaEm: new Date(),
    })
    .where(
      and(
        eq(notificacoesTable.id, notificacaoId),
        eq(notificacoesTable.userId, userId),
      ),
    );
}

