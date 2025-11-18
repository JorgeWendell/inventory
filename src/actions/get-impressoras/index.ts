"use server";

import { db } from "@/db";
import { impressoraTable } from "@/db/schema";

export async function getImpressoras() {
  const impressoras = await db
    .select({
      nome: impressoraTable.nome,
    })
    .from(impressoraTable)
    .orderBy(impressoraTable.nome);

  return impressoras;
}

