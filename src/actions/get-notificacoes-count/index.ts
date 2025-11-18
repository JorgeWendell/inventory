"use server";

import { db } from "@/db";
import { notificacoesTable } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function getNotificacoesCount(userId: string) {
  const [result] = await db
    .select({
      total: sql<number>`count(*)::int`.as("total"),
      criticas: sql<number>`count(*) filter (where ${notificacoesTable.prioridade} = 'critica' and ${notificacoesTable.lida} = false)::int`.as("criticas"),
      altas: sql<number>`count(*) filter (where ${notificacoesTable.prioridade} = 'alta' and ${notificacoesTable.lida} = false)::int`.as("altas"),
    })
    .from(notificacoesTable)
    .where(
      and(
        eq(notificacoesTable.userId, userId),
        eq(notificacoesTable.lida, false),
      ),
    );

  return {
    total: Number(result?.total || 0),
    criticas: Number(result?.criticas || 0),
    altas: Number(result?.altas || 0),
  };
}

