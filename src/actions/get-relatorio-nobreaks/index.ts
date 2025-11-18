"use server";

import { db } from "@/db";
import { nobreakTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioNobreaks() {
  const nobreaks = await db
    .select({
      marca: nobreakTable.marca,
      modelo: nobreakTable.modelo,
      capacidade: nobreakTable.capacidade,
      localidade: nobreakTable.localidadeNome,
      usuario: nobreakTable.usuarioNome,
      computador: nobreakTable.computadoresNome,
      updateUserName: usersTable.name,
    })
    .from(nobreakTable)
    .leftJoin(usersTable, eq(nobreakTable.updateUserId, usersTable.id));

  return nobreaks.map((n) => ({
    marca: n.marca || "N/A",
    modelo: n.modelo || "N/A",
    capacidade: n.capacidade || "N/A",
    localidade: n.localidade || "N/A",
    usuario: n.usuario || "N/A",
    computador: n.computador || "N/A",
    atualizadoPor: n.updateUserName || "N/A",
  }));
}

