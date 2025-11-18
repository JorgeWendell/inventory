"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { officeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertOfficeSchema } from "./schema";

export const upsertOffice = actionClient
  .schema(upsertOfficeSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const officeExistente = await db
        .select()
        .from(officeTable)
        .where(eq(officeTable.id, parsedInput.id))
        .limit(1);

      if (officeExistente.length === 0) {
        throw new Error("Office não encontrado");
      }

      await db
        .update(officeTable)
        .set({
          nomeO365: parsedInput.nomeO365,
          senha: parsedInput.senha || null,
          computadorNome: parsedInput.computadorNome,
          usuarioNome: parsedInput.usuarioNome || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(officeTable.id, parsedInput.id));
    } else {
      await db.insert(officeTable).values({
        id,
        nomeO365: parsedInput.nomeO365,
        senha: parsedInput.senha || null,
        computadorNome: parsedInput.computadorNome,
        usuarioNome: parsedInput.usuarioNome || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/inventario/office");

    return {
      message: parsedInput.id
        ? "Office atualizado com sucesso!"
        : "Office cadastrado com sucesso!",
    };
  });

