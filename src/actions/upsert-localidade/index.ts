"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { localidadeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertLocalidadeSchema } from "./schema";

export const upsertLocalidade = actionClient
  .schema(upsertLocalidadeSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const localidadeExistente = await db
        .select()
        .from(localidadeTable)
        .where(eq(localidadeTable.id, parsedInput.id))
        .limit(1);

      if (localidadeExistente.length === 0) {
        throw new Error("Localidade não encontrada");
      }

      const nomeExistente = await db
        .select()
        .from(localidadeTable)
        .where(eq(localidadeTable.nome, parsedInput.nome))
        .limit(1);

      if (
        nomeExistente.length > 0 &&
        nomeExistente[0].id !== parsedInput.id
      ) {
        throw new Error("Já existe uma localidade com este nome");
      }

      await db
        .update(localidadeTable)
        .set({
          nome: parsedInput.nome,
          endereco: parsedInput.endereco || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(localidadeTable.id, parsedInput.id));
    } else {
      const localidadeExistente = await db
        .select()
        .from(localidadeTable)
        .where(eq(localidadeTable.nome, parsedInput.nome))
        .limit(1);

      if (localidadeExistente.length > 0) {
        throw new Error("Já existe uma localidade com este nome");
      }

      await db.insert(localidadeTable).values({
        id,
        nome: parsedInput.nome,
        endereco: parsedInput.endereco || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/inventario/localidades");

    return {
      message: parsedInput.id
        ? "Localidade atualizada com sucesso!"
        : "Localidade cadastrada com sucesso!",
    };
  });

