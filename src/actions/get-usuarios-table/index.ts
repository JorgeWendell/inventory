"use server";

import { db } from "@/db";
import { usuarioTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUsuariosTable() {
  const usuarios = await db
    .select({
      id: usuarioTable.id,
      login: usuarioTable.login,
      nome: usuarioTable.nome,
      depto: usuarioTable.depto,
      localidadeNome: usuarioTable.localidadeNome,
      updateUserEmail: usersTable.email,
    })
    .from(usuarioTable)
    .leftJoin(usersTable, eq(usuarioTable.updateUserId, usersTable.id))
    .orderBy(usuarioTable.nome);

  return usuarios.map((usuario) => ({
    id: usuario.id,
    login: usuario.login,
    nome: usuario.nome,
    depto: usuario.depto || "-",
    localidadeNome: usuario.localidadeNome || "-",
    editadoPor: usuario.updateUserEmail || "-",
  }));
}

