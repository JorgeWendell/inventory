"use server";

import { db } from "@/db";
import { localidadeTable } from "@/db/schema";

export async function getLocalidades() {
  const localidades = await db
    .select({
      nome: localidadeTable.nome,
    })
    .from(localidadeTable)
    .orderBy(localidadeTable.nome);

  return localidades;
}

