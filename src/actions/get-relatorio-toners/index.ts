"use server";

import { db } from "@/db";
import { tonerTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioToners() {
  const toners = await db
    .select({
      nome: tonerTable.nome,
      cor: tonerTable.cor,
      localidade: tonerTable.localidadeNome,
      impressora: tonerTable.impressoraNome,
      estoqueAtual: tonerTable.estoqueAtual,
      estoqueMin: tonerTable.estoqueMin,
      updateUserName: usersTable.name,
    })
    .from(tonerTable)
    .leftJoin(usersTable, eq(tonerTable.updateUserId, usersTable.id));

  return toners.map((t) => ({
    nome: t.nome,
    cor: t.cor || "N/A",
    localidade: t.localidade || "N/A",
    impressora: t.impressora || "N/A",
    estoqueAtual: t.estoqueAtual,
    estoqueMin: t.estoqueMin,
    atualizadoPor: t.updateUserName || "N/A",
  }));
}

