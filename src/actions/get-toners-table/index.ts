"use server";

import { db } from "@/db";
import { tonerTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getTonersTable() {
  const toners = await db
    .select({
      id: tonerTable.id,
      nome: tonerTable.nome,
      cor: tonerTable.cor,
      impressoraNome: tonerTable.impressoraNome,
      localidadeNome: tonerTable.localidadeNome,
      estoqueAtual: tonerTable.estoqueAtual,
      updateUserEmail: usersTable.email,
    })
    .from(tonerTable)
    .leftJoin(usersTable, eq(tonerTable.updateUserId, usersTable.id))
    .orderBy(tonerTable.nome);

  return toners.map((toner) => ({
    id: toner.id,
    nome: toner.nome,
    cor: toner.cor || "-",
    impressoraNome: toner.impressoraNome || "-",
    localidadeNome: toner.localidadeNome || "-",
    estoqueAtual: toner.estoqueAtual ?? 0,
    editadoPor: toner.updateUserEmail || "-",
  }));
}

