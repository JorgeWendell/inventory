"use server";

import { db } from "@/db";
import { servidorTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioServidores() {
  const servidores = await db
    .select({
      nome: servidorTable.nome,
      vm: servidorTable.vm,
      funcao: servidorTable.funcao,
      memoria: servidorTable.memoria,
      disco1: servidorTable.disco1,
      disco2: servidorTable.disco2,
      disco3: servidorTable.disco3,
      disco4: servidorTable.disco4,
      disco5: servidorTable.disco5,
      updateUserName: usersTable.name,
    })
    .from(servidorTable)
    .leftJoin(usersTable, eq(servidorTable.updateUserId, usersTable.id));

  return servidores.map((s) => ({
    nome: s.nome,
    vm: s.vm,
    funcao: s.funcao || "N/A",
    memoria: s.memoria || "N/A",
    disco1: s.disco1 || "N/A",
    disco2: s.disco2 || "N/A",
    disco3: s.disco3 || "N/A",
    disco4: s.disco4 || "N/A",
    disco5: s.disco5 || "N/A",
    atualizadoPor: s.updateUserName || "N/A",
  }));
}

