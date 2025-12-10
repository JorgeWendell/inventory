"use server";

import { db } from "@/db";
import { impressoraTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioImpressoras() {
  const impressoras = await db
    .select({
      nome: impressoraTable.nome,
      marca: impressoraTable.marca,
      modelo: impressoraTable.modelo,
      localidade: impressoraTable.localidadeNome,
      usuario: impressoraTable.usuarioNome,
      manutencao: impressoraTable.manutencao,
      updateUserName: usersTable.name,
    })
    .from(impressoraTable)
    .leftJoin(usersTable, eq(impressoraTable.updateUserId, usersTable.id));

  return impressoras.map((i) => ({
    nome: i.nome,
    marca: i.marca || "N/A",
    modelo: i.modelo || "N/A",
    localidade: i.localidade || "N/A",
    usuario: i.usuario || "N/A",
    manutencao: i.manutencao ? "Sim" : "Não",
    atualizadoPor: i.updateUserName || "N/A",
  }));
}

