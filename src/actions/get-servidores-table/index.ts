"use server";

import { db } from "@/db";
import { servidorTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getServidoresTable() {
  const servidores = await db
    .select({
      id: servidorTable.id,
      nome: servidorTable.nome,
      funcao: servidorTable.funcao,
      vm: servidorTable.vm,
      updateUserEmail: usersTable.email,
    })
    .from(servidorTable)
    .leftJoin(usersTable, eq(servidorTable.updateUserId, usersTable.id))
    .orderBy(servidorTable.nome);

  return servidores.map((servidor) => ({
    id: servidor.id,
    nome: servidor.nome,
    funcao: servidor.funcao || "-",
    vm: servidor.vm ? "Sim" : "Não",
    editadoPor: servidor.updateUserEmail || "-",
  }));
}

