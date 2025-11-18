"use server";

import { db } from "@/db";
import { tonerTable } from "@/db/schema";

export async function getToners() {
  const toners = await db
    .select({
      id: tonerTable.id,
      nome: tonerTable.nome,
    })
    .from(tonerTable)
    .orderBy(tonerTable.nome);

  return toners;
}

