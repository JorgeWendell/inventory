"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { acessosDepartamentosUsuariosTable } from "@/db/schema";

export async function getAcessoDepartamentoUsuarios(
  acessoDepartamentoId: string,
) {
  const usuarios = await db
    .select({
      usuarioNome: acessosDepartamentosUsuariosTable.usuarioNome,
    })
    .from(acessosDepartamentosUsuariosTable)
    .where(
      eq(
        acessosDepartamentosUsuariosTable.acessoDepartamentoId,
        acessoDepartamentoId,
      ),
    );

  return usuarios.map((u) => u.usuarioNome);
}

