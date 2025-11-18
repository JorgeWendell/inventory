"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { nobreakTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertNobreakSchema } from "./schema";

export const upsertNobreak = actionClient
  .schema(upsertNobreakSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const nobreakExistente = await db
        .select()
        .from(nobreakTable)
        .where(eq(nobreakTable.id, parsedInput.id))
        .limit(1);

      if (nobreakExistente.length === 0) {
        throw new Error("Nobreak não encontrado");
      }

      await db
        .update(nobreakTable)
        .set({
          marca: parsedInput.marca || null,
          modelo: parsedInput.modelo || null,
          capacidade: parsedInput.capacidade || null,
          localidadeNome: parsedInput.localidadeNome || null,
          usuarioNome: parsedInput.usuarioNome || null,
          computadoresNome: parsedInput.computadoresNome || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(nobreakTable.id, parsedInput.id));
    } else {
      await db.insert(nobreakTable).values({
        id,
        marca: parsedInput.marca || null,
        modelo: parsedInput.modelo || null,
        capacidade: parsedInput.capacidade || null,
        localidadeNome: parsedInput.localidadeNome || null,
        usuarioNome: parsedInput.usuarioNome || null,
        computadoresNome: parsedInput.computadoresNome || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/inventario/nobreaks");

    return {
      message: parsedInput.id
        ? "Nobreak atualizado com sucesso!"
        : "Nobreak cadastrado com sucesso!",
    };
  });

