"use server";

import { db } from "@/db";
import { acessosDepartamentosTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAcessosDepartamentosTable() {
  const acessosDepartamentos = await db
    .select({
      id: acessosDepartamentosTable.id,
      usuarioLogin: acessosDepartamentosTable.usuarioLogin,
      computadorNome: acessosDepartamentosTable.computadorNome,
      pastaDepartamentos: acessosDepartamentosTable.pastaDepartamentos,
      updateUserEmail: usersTable.email,
    })
    .from(acessosDepartamentosTable)
    .leftJoin(usersTable, eq(acessosDepartamentosTable.updateUserId, usersTable.id))
    .orderBy(acessosDepartamentosTable.usuarioLogin);

  return acessosDepartamentos.map((acesso) => ({
    id: acesso.id,
    usuarioLogin: acesso.usuarioLogin,
    computadorNome: acesso.computadorNome,
    pastaDepartamentos: acesso.pastaDepartamentos,
    editadoPor: acesso.updateUserEmail || "-",
  }));
}

