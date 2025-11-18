"use server";

import { db } from "@/db";
import { usuarioTable } from "@/db/schema";

export async function getUsuariosLogin() {
  const usuarios = await db
    .select({
      login: usuarioTable.login,
      nome: usuarioTable.nome,
    })
    .from(usuarioTable)
    .orderBy(usuarioTable.nome);

  return usuarios;
}

