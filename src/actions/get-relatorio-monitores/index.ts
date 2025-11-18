"use server";

import { db } from "@/db";
import { monitorTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioMonitores() {
  const monitores = await db
    .select({
      marca: monitorTable.marca,
      modelo: monitorTable.modelo,
      localidade: monitorTable.localidadeNome,
      usuario: monitorTable.usuarioNome,
      updateUserName: usersTable.name,
    })
    .from(monitorTable)
    .leftJoin(usersTable, eq(monitorTable.updateUserId, usersTable.id));

  return monitores.map((m) => ({
    marca: m.marca || "N/A",
    modelo: m.modelo || "N/A",
    localidade: m.localidade || "N/A",
    usuario: m.usuario || "N/A",
    atualizadoPor: m.updateUserName || "N/A",
  }));
}

