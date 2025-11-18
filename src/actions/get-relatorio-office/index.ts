"use server";

import { db } from "@/db";
import { officeTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioOffice() {
  const offices = await db
    .select({
      nomeO365: officeTable.nomeO365,
      computador: officeTable.computadorNome,
      usuario: officeTable.usuarioNome,
      updateUserName: usersTable.name,
    })
    .from(officeTable)
    .leftJoin(usersTable, eq(officeTable.updateUserId, usersTable.id));

  return offices.map((o) => ({
    nomeO365: o.nomeO365,
    computador: o.computador,
    usuario: o.usuario || "N/A",
    atualizadoPor: o.updateUserName || "N/A",
  }));
}

