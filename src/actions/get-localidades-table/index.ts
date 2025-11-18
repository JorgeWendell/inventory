"use server";

import { db } from "@/db";
import { localidadeTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getLocalidadesTable() {
  const localidades = await db
    .select({
      id: localidadeTable.id,
      nome: localidadeTable.nome,
      endereco: localidadeTable.endereco,
      updateUserEmail: usersTable.email,
    })
    .from(localidadeTable)
    .leftJoin(usersTable, eq(localidadeTable.updateUserId, usersTable.id))
    .orderBy(localidadeTable.nome);

  return localidades.map((localidade) => ({
    id: localidade.id,
    nome: localidade.nome,
    endereco: localidade.endereco || "-",
    editadoPor: localidade.updateUserEmail || "-",
  }));
}

