"use server";

import { db } from "@/db";
import { officeTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOfficeTable() {
  const offices = await db
    .select({
      id: officeTable.id,
      nomeO365: officeTable.nomeO365,
      senha: officeTable.senha,
      computadorNome: officeTable.computadorNome,
      usuarioNome: officeTable.usuarioNome,
      updateUserEmail: usersTable.email,
    })
    .from(officeTable)
    .leftJoin(usersTable, eq(officeTable.updateUserId, usersTable.id))
    .orderBy(officeTable.nomeO365);

  return offices.map((office) => ({
    id: office.id,
    nome: office.nomeO365,
    senha: office.senha || "-",
    computadorNome: office.computadorNome,
    usuarioNome: office.usuarioNome || "-",
    editadoPor: office.updateUserEmail || "-",
  }));
}

