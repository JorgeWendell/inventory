"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { usuarioTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { upsertUsuarioSchema } from "./schema";

export const upsertUsuario = actionClient
  .schema(upsertUsuarioSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const usuarioExistente = await db
        .select()
        .from(usuarioTable)
        .where(eq(usuarioTable.id, parsedInput.id))
        .limit(1);

      if (usuarioExistente.length === 0) {
        throw new Error("Usuário não encontrado");
      }

      const loginExistente = await db
        .select()
        .from(usuarioTable)
        .where(eq(usuarioTable.login, parsedInput.login))
        .limit(1);

      if (
        loginExistente.length > 0 &&
        loginExistente[0].id !== parsedInput.id
      ) {
        throw new Error("Já existe um usuário com este login");
      }

      const nomeExistente = await db
        .select()
        .from(usuarioTable)
        .where(eq(usuarioTable.nome, parsedInput.nome))
        .limit(1);

      if (
        nomeExistente.length > 0 &&
        nomeExistente[0].id !== parsedInput.id
      ) {
        throw new Error("Já existe um usuário com este nome");
      }

      await db
        .update(usuarioTable)
        .set({
          login: parsedInput.login,
          nome: parsedInput.nome,
          cargo: parsedInput.cargo || null,
          depto: parsedInput.depto || null,
          localidadeNome: parsedInput.localidadeNome || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(usuarioTable.id, parsedInput.id));

      await createLog({
        tipo: "usuario",
        entidadeId: parsedInput.id,
        acao: "atualizado",
        descricao: `Usuário atualizado: ${parsedInput.nome} (${parsedInput.login})`,
        dadosAnteriores: {
          login: usuarioExistente[0].login,
          nome: usuarioExistente[0].nome,
          cargo: usuarioExistente[0].cargo,
          depto: usuarioExistente[0].depto,
        },
        dadosNovos: {
          login: parsedInput.login,
          nome: parsedInput.nome,
          cargo: parsedInput.cargo,
          depto: parsedInput.depto,
        },
        updateUserId: session.user.id,
      });
    } else {
      const loginExistente = await db
        .select()
        .from(usuarioTable)
        .where(eq(usuarioTable.login, parsedInput.login))
        .limit(1);

      if (loginExistente.length > 0) {
        throw new Error("Já existe um usuário com este login");
      }

      const nomeExistente = await db
        .select()
        .from(usuarioTable)
        .where(eq(usuarioTable.nome, parsedInput.nome))
        .limit(1);

      if (nomeExistente.length > 0) {
        throw new Error("Já existe um usuário com este nome");
      }

      await db.insert(usuarioTable).values({
        id,
        login: parsedInput.login,
        nome: parsedInput.nome,
        cargo: parsedInput.cargo || null,
        depto: parsedInput.depto || null,
        localidadeNome: parsedInput.localidadeNome || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createLog({
        tipo: "usuario",
        entidadeId: id,
        acao: "criado",
        descricao: `Usuário criado: ${parsedInput.nome} (${parsedInput.login})`,
        dadosNovos: {
          login: parsedInput.login,
          nome: parsedInput.nome,
          cargo: parsedInput.cargo,
          depto: parsedInput.depto,
        },
        updateUserId: session.user.id,
      });
    }

    revalidatePath("/inventario/usuarios");

    return {
      message: parsedInput.id
        ? "Usuário atualizado com sucesso!"
        : "Usuário cadastrado com sucesso!",
    };
  });

