"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { tonerTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertTonerSchema } from "./schema";

export const upsertToner = actionClient
  .schema(upsertTonerSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const tonerExistente = await db
        .select()
        .from(tonerTable)
        .where(eq(tonerTable.id, parsedInput.id))
        .limit(1);

      if (tonerExistente.length === 0) {
        throw new Error("Toner não encontrado");
      }

      const nomeExistente = await db
        .select()
        .from(tonerTable)
        .where(eq(tonerTable.nome, parsedInput.nome))
        .limit(1);

      if (
        nomeExistente.length > 0 &&
        nomeExistente[0].id !== parsedInput.id
      ) {
        throw new Error("Já existe um toner com este nome");
      }

      await db
        .update(tonerTable)
        .set({
          nome: parsedInput.nome,
          cor: parsedInput.cor || null,
          localidadeNome: parsedInput.localidadeNome || null,
          impressoraNome: parsedInput.impressoraNome || null,
          estoqueMin: parsedInput.estoqueMin || 0,
          estoqueAtual: parsedInput.estoqueAtual || 0,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(tonerTable.id, parsedInput.id));
    } else {
      const nomeExistente = await db
        .select()
        .from(tonerTable)
        .where(eq(tonerTable.nome, parsedInput.nome))
        .limit(1);

      if (nomeExistente.length > 0) {
        throw new Error("Já existe um toner com este nome");
      }

      await db.insert(tonerTable).values({
        id,
        nome: parsedInput.nome,
        cor: parsedInput.cor || null,
        localidadeNome: parsedInput.localidadeNome || null,
        impressoraNome: parsedInput.impressoraNome || null,
        estoqueMin: parsedInput.estoqueMin || 0,
        estoqueAtual: parsedInput.estoqueAtual || 0,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/inventario/toners");

    return {
      message: parsedInput.id
        ? "Toner atualizado com sucesso!"
        : "Toner cadastrado com sucesso!",
    };
  });

