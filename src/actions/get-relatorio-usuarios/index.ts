"use server";

import { db } from "@/db";
import { usuarioTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioUsuarios() {
  const usuarios = await db
    .select({
      login: usuarioTable.login,
      nome: usuarioTable.nome,
      cargo: usuarioTable.cargo,
      depto: usuarioTable.depto,
      localidade: usuarioTable.localidadeNome,
      updateUserName: usersTable.name,
    })
    .from(usuarioTable)
    .leftJoin(usersTable, eq(usuarioTable.updateUserId, usersTable.id));

  return usuarios.map((u) => ({
    login: u.login,
    nome: u.nome,
    cargo: u.cargo || "N/A",
    depto: u.depto || "N/A",
    localidade: u.localidade || "N/A",
    atualizadoPor: u.updateUserName || "N/A",
  }));
}

