"use server";

import { db } from "@/db";
import { computadoresTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getComputadoresTable() {
  const computadores = await db
    .select({
      id: computadoresTable.id,
      nome: computadoresTable.nome,
      marca: computadoresTable.marca,
      modelo: computadoresTable.modelo,
      manutencao: computadoresTable.manutencao,
      localidadeNome: computadoresTable.localidadeNome,
      usuarioNome: computadoresTable.usuarioNome,
      updateUserEmail: usersTable.email,
    })
    .from(computadoresTable)
    .leftJoin(usersTable, eq(computadoresTable.updateUserId, usersTable.id))
    .orderBy(computadoresTable.nome);

  return computadores.map((computador) => ({
    id: computador.id,
    nome: computador.nome,
    marca: computador.marca || "-",
    modelo: computador.modelo || "-",
    manutencao: computador.manutencao ?? false,
    localidadeNome: computador.localidadeNome || "-",
    usuarioNome: computador.usuarioNome || "-",
    editadoPor: computador.updateUserEmail || "-",
  }));
}

