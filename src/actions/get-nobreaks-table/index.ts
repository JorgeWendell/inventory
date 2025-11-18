"use server";

import { db } from "@/db";
import { nobreakTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getNobreaksTable() {
  const nobreaks = await db
    .select({
      id: nobreakTable.id,
      marca: nobreakTable.marca,
      modelo: nobreakTable.modelo,
      capacidade: nobreakTable.capacidade,
      localidadeNome: nobreakTable.localidadeNome,
      usuarioNome: nobreakTable.usuarioNome,
      computadoresNome: nobreakTable.computadoresNome,
      updateUserEmail: usersTable.email,
    })
    .from(nobreakTable)
    .leftJoin(usersTable, eq(nobreakTable.updateUserId, usersTable.id))
    .orderBy(nobreakTable.marca);

  return nobreaks.map((nobreak) => ({
    id: nobreak.id,
    marca: nobreak.marca || "-",
    modelo: nobreak.modelo || "-",
    capacidade: nobreak.capacidade || "-",
    localidadeNome: nobreak.localidadeNome || "-",
    usuarioNome: nobreak.usuarioNome || "-",
    computadoresNome: nobreak.computadoresNome || "-",
    editadoPor: nobreak.updateUserEmail || "-",
  }));
}

