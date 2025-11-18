"use server";

import { db } from "@/db";
import { computadoresTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioComputadores() {
  const computadores = await db
    .select({
      nome: computadoresTable.nome,
      marca: computadoresTable.marca,
      modelo: computadoresTable.modelo,
      processador: computadoresTable.processador,
      memoria: computadoresTable.memoria,
      disco: computadoresTable.disco,
      garantia: computadoresTable.garantia,
      localidade: computadoresTable.localidadeNome,
      usuario: computadoresTable.usuarioNome,
      updateUserName: usersTable.name,
    })
    .from(computadoresTable)
    .leftJoin(usersTable, eq(computadoresTable.updateUserId, usersTable.id));

  return computadores.map((c) => ({
    nome: c.nome,
    marca: c.marca || "N/A",
    modelo: c.modelo || "N/A",
    processador: c.processador || "N/A",
    memoria: c.memoria || "N/A",
    disco: c.disco || "N/A",
    garantia: c.garantia ? new Date(c.garantia).toLocaleDateString("pt-BR") : "N/A",
    localidade: c.localidade || "N/A",
    usuario: c.usuario || "N/A",
    atualizadoPor: c.updateUserName || "N/A",
  }));
}

