"use server";

import { db } from "@/db";
import { acessosDepartamentosTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioAcessosDepartamentos() {
  const acessos = await db
    .select({
      usuarioLogin: acessosDepartamentosTable.usuarioLogin,
      computadorNome: acessosDepartamentosTable.computadorNome,
      pastaDepartamentos: acessosDepartamentosTable.pastaDepartamentos,
      updateUserName: usersTable.name,
    })
    .from(acessosDepartamentosTable)
    .leftJoin(usersTable, eq(acessosDepartamentosTable.updateUserId, usersTable.id));

  return acessos.map((a) => ({
    usuarioLogin: a.usuarioLogin || "N/A",
    computadorNome: a.computadorNome || "N/A",
    pastaDepartamentos: a.pastaDepartamentos,
    atualizadoPor: a.updateUserName || "N/A",
  }));
}

