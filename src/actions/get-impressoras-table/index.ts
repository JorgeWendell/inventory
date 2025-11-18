"use server";

import { db } from "@/db";
import { impressoraTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getImpressorasTable() {
  const impressoras = await db
    .select({
      id: impressoraTable.id,
      nome: impressoraTable.nome,
      marca: impressoraTable.marca,
      modelo: impressoraTable.modelo,
      localidadeNome: impressoraTable.localidadeNome,
      manutencao: impressoraTable.manutencao,
      updateUserEmail: usersTable.email,
    })
    .from(impressoraTable)
    .leftJoin(usersTable, eq(impressoraTable.updateUserId, usersTable.id))
    .orderBy(impressoraTable.nome);

  return impressoras.map((impressora) => ({
    id: impressora.id,
    nome: impressora.nome,
    marca: impressora.marca || "-",
    modelo: impressora.modelo || "-",
    localidadeNome: impressora.localidadeNome || "-",
    manutencao: impressora.manutencao ? "Sim" : "Não",
    editadoPor: impressora.updateUserEmail || "-",
  }));
}

