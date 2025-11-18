"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { monitorTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertMonitorSchema } from "./schema";

export const upsertMonitor = actionClient
  .schema(upsertMonitorSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const monitorExistente = await db
        .select()
        .from(monitorTable)
        .where(eq(monitorTable.id, parsedInput.id))
        .limit(1);

      if (monitorExistente.length === 0) {
        throw new Error("Monitor não encontrado");
      }

      await db
        .update(monitorTable)
        .set({
          marca: parsedInput.marca || null,
          modelo: parsedInput.modelo || null,
          localidadeNome: parsedInput.localidadeNome || null,
          usuarioNome: parsedInput.usuarioNome || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(monitorTable.id, parsedInput.id));
    } else {
      await db.insert(monitorTable).values({
        id,
        marca: parsedInput.marca || null,
        modelo: parsedInput.modelo || null,
        localidadeNome: parsedInput.localidadeNome || null,
        usuarioNome: parsedInput.usuarioNome || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/inventario/monitores");

    return {
      message: parsedInput.id
        ? "Monitor atualizado com sucesso!"
        : "Monitor cadastrado com sucesso!",
    };
  });

