"use server";

import { db } from "@/db";
import { materiaisDeTiTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getMateriaisDeTiTable() {
  const materiais = await db
    .select({
      id: materiaisDeTiTable.id,
      nome: materiaisDeTiTable.nome,
      categoria: materiaisDeTiTable.categoria,
      estoqueMin: materiaisDeTiTable.estoqueMin,
      estoqueAtual: materiaisDeTiTable.estoqueAtual,
      localidadeNome: materiaisDeTiTable.localidadeNome,
      updateUserEmail: usersTable.email,
    })
    .from(materiaisDeTiTable)
    .leftJoin(usersTable, eq(materiaisDeTiTable.updateUserId, usersTable.id))
    .orderBy(materiaisDeTiTable.nome);

  return materiais.map((material) => ({
    id: material.id,
    nome: material.nome,
    categoria: material.categoria || "-",
    estoqueMin: material.estoqueMin ?? 0,
    estoqueAtual: material.estoqueAtual ?? 0,
    localidadeNome: material.localidadeNome || "-",
    editadoPor: material.updateUserEmail || "-",
  }));
}


