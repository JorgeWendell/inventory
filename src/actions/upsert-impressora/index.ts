"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { impressoraTable, impressorasTonersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { upsertImpressoraSchema } from "./schema";

export const upsertImpressora = actionClient
  .schema(upsertImpressoraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const impressoraExistente = await db
        .select()
        .from(impressoraTable)
        .where(eq(impressoraTable.id, parsedInput.id))
        .limit(1);

      if (impressoraExistente.length === 0) {
        throw new Error("Impressora não encontrada");
      }

      const nomeExistente = await db
        .select()
        .from(impressoraTable)
        .where(eq(impressoraTable.nome, parsedInput.nome))
        .limit(1);

      if (
        nomeExistente.length > 0 &&
        nomeExistente[0].id !== parsedInput.id
      ) {
        throw new Error("Já existe uma impressora com este nome");
      }

      await db
        .update(impressoraTable)
        .set({
          nome: parsedInput.nome,
          marca: parsedInput.marca || null,
          modelo: parsedInput.modelo || null,
          localidadeNome: parsedInput.localidadeNome || null,
          manutencao: parsedInput.manutencao,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(impressoraTable.id, parsedInput.id));

      if (impressoraExistente.length > 0) {
        await createLog({
          tipo: "impressora",
          entidadeId: parsedInput.id,
          acao: "atualizado",
          descricao: `Impressora atualizada: ${parsedInput.nome}`,
          dadosAnteriores: {
            nome: impressoraExistente[0].nome,
            marca: impressoraExistente[0].marca,
            modelo: impressoraExistente[0].modelo,
            manutencao: impressoraExistente[0].manutencao,
            localidadeNome: impressoraExistente[0].localidadeNome,
          },
          dadosNovos: {
            nome: parsedInput.nome,
            marca: parsedInput.marca,
            modelo: parsedInput.modelo,
            manutencao: parsedInput.manutencao,
            localidadeNome: parsedInput.localidadeNome,
          },
          updateUserId: session.user.id,
        });
      }

      await db
        .delete(impressorasTonersTable)
        .where(eq(impressorasTonersTable.impressoraId, parsedInput.id));

      if (parsedInput.toners.length > 0) {
        await db.insert(impressorasTonersTable).values(
          parsedInput.toners.map((toner) => ({
            id: crypto.randomUUID(),
            impressoraId: parsedInput.id!,
            tonerNome: toner.tonerNome,
            quantidade: toner.quantidade,
            createdAt: new Date(),
          })),
        );
      }
    } else {
      const nomeExistente = await db
        .select()
        .from(impressoraTable)
        .where(eq(impressoraTable.nome, parsedInput.nome))
        .limit(1);

      if (nomeExistente.length > 0) {
        throw new Error("Já existe uma impressora com este nome");
      }

      await db.insert(impressoraTable).values({
        id,
        nome: parsedInput.nome,
        marca: parsedInput.marca || null,
        modelo: parsedInput.modelo || null,
        localidadeNome: parsedInput.localidadeNome || null,
        manutencao: parsedInput.manutencao,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createLog({
        tipo: "impressora",
        entidadeId: id,
        acao: "criado",
        descricao: `Impressora criada: ${parsedInput.nome}`,
        dadosNovos: {
          nome: parsedInput.nome,
          marca: parsedInput.marca,
          modelo: parsedInput.modelo,
          manutencao: parsedInput.manutencao,
          localidadeNome: parsedInput.localidadeNome,
        },
        updateUserId: session.user.id,
      });

      if (parsedInput.toners.length > 0) {
        await db.insert(impressorasTonersTable).values(
          parsedInput.toners.map((toner) => ({
            id: crypto.randomUUID(),
            impressoraId: id,
            tonerNome: toner.tonerNome,
            quantidade: toner.quantidade,
            createdAt: new Date(),
          })),
        );
      }
    }

    revalidatePath("/inventario/impressoras");

    return {
      message: parsedInput.id
        ? "Impressora atualizada com sucesso!"
        : "Impressora cadastrada com sucesso!",
    };
  });

