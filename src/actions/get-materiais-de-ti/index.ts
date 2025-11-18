"use server";

import { db } from "@/db";
import { materiaisDeTiTable } from "@/db/schema";

export async function getMateriaisDeTi() {
  const materiais = await db
    .select({
      id: materiaisDeTiTable.id,
      nome: materiaisDeTiTable.nome,
    })
    .from(materiaisDeTiTable)
    .orderBy(materiaisDeTiTable.nome);

  return materiais;
}


