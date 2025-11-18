"use server";

import { db } from "@/db";
import { usuarioTable } from "@/db/schema";

export async function getUsuarios() {
  const usuarios = await db
    .select({
      nome: usuarioTable.nome,
    })
    .from(usuarioTable)
    .orderBy(usuarioTable.nome);

  return usuarios;
}

