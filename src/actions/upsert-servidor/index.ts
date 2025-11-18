"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { servidorTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertServidorSchema } from "./schema";

export const upsertServidor = actionClient
  .schema(upsertServidorSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const servidorExistente = await db
        .select()
        .from(servidorTable)
        .where(eq(servidorTable.id, parsedInput.id))
        .limit(1);

      if (servidorExistente.length === 0) {
        throw new Error("Servidor não encontrado");
      }

      const nomeExistente = await db
        .select()
        .from(servidorTable)
        .where(eq(servidorTable.nome, parsedInput.nome))
        .limit(1);

      if (
        nomeExistente.length > 0 &&
        nomeExistente[0].id !== parsedInput.id
      ) {
        throw new Error("Já existe um servidor com este nome");
      }

      await db
        .update(servidorTable)
        .set({
          nome: parsedInput.nome,
          memoria: parsedInput.memoria || null,
          disco1: parsedInput.disco1 || null,
          disco2: parsedInput.disco2 || null,
          disco3: parsedInput.disco3 || null,
          disco4: parsedInput.disco4 || null,
          disco5: parsedInput.disco5 || null,
          vm: parsedInput.vm,
          funcao: parsedInput.funcao || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(servidorTable.id, parsedInput.id));
    } else {
      const nomeExistente = await db
        .select()
        .from(servidorTable)
        .where(eq(servidorTable.nome, parsedInput.nome))
        .limit(1);

      if (nomeExistente.length > 0) {
        throw new Error("Já existe um servidor com este nome");
      }

      await db.insert(servidorTable).values({
        id,
        nome: parsedInput.nome,
        memoria: parsedInput.memoria || null,
        disco1: parsedInput.disco1 || null,
        disco2: parsedInput.disco2 || null,
        disco3: parsedInput.disco3 || null,
        disco4: parsedInput.disco4 || null,
        disco5: parsedInput.disco5 || null,
        vm: parsedInput.vm,
        funcao: parsedInput.funcao || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/inventario/servidores");

    return {
      message: parsedInput.id
        ? "Servidor atualizado com sucesso!"
        : "Servidor cadastrado com sucesso!",
    };
  });

