"use server";

import { db } from "@/db";
import { monitorTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getMonitoresTable() {
  const monitores = await db
    .select({
      id: monitorTable.id,
      marca: monitorTable.marca,
      modelo: monitorTable.modelo,
      usuarioNome: monitorTable.usuarioNome,
      localidadeNome: monitorTable.localidadeNome,
      updateUserEmail: usersTable.email,
    })
    .from(monitorTable)
    .leftJoin(usersTable, eq(monitorTable.updateUserId, usersTable.id))
    .orderBy(monitorTable.marca);

  return monitores.map((monitor) => ({
    id: monitor.id,
    marca: monitor.marca || "-",
    modelo: monitor.modelo || "-",
    usuarioNome: monitor.usuarioNome || "-",
    localidadeNome: monitor.localidadeNome || "-",
    editadoPor: monitor.updateUserEmail || "-",
  }));
}

