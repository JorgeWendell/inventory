"use server";

import { db } from "@/db";
import { computadoresTable } from "@/db/schema";

export async function getComputadores() {
  const computadores = await db
    .select({
      nome: computadoresTable.nome,
    })
    .from(computadoresTable)
    .orderBy(computadoresTable.nome);

  return computadores;
}

