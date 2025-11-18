"use server";

import { db } from "@/db";
import { notificacoesTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function marcarTodasNotificacoesLidas(userId: string) {
  await db
    .update(notificacoesTable)
    .set({
      lida: true,
      lidaEm: new Date(),
    })
    .where(
      and(
        eq(notificacoesTable.userId, userId),
        eq(notificacoesTable.lida, false),
      ),
    );
}

