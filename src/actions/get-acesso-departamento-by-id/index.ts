"use server";

import { db } from "@/db";
import { acessosDepartamentosTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAcessoDepartamentoById(id: string) {
  const acessoDepartamento = await db
    .select()
    .from(acessosDepartamentosTable)
    .where(eq(acessosDepartamentosTable.id, id))
    .limit(1);

  return acessoDepartamento[0] || null;
}

