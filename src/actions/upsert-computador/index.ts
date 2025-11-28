"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { computadoresTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { upsertComputadorSchema } from "./schema";

export const upsertComputador = actionClient
  .schema(upsertComputadorSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const computadorExistente = await db
        .select()
        .from(computadoresTable)
        .where(eq(computadoresTable.id, parsedInput.id))
        .limit(1);

      if (computadorExistente.length === 0) {
        throw new Error("Computador não encontrado");
      }

      const nomeExistente = await db
        .select()
        .from(computadoresTable)
        .where(eq(computadoresTable.nome, parsedInput.nome))
        .limit(1);

      if (
        nomeExistente.length > 0 &&
        nomeExistente[0].id !== parsedInput.id
      ) {
        throw new Error("Já existe um computador com este nome");
      }

      await db
        .update(computadoresTable)
        .set({
          nome: parsedInput.nome,
          marca: parsedInput.marca || null,
          modelo: parsedInput.modelo || null,
          processador: parsedInput.processador || null,
          memoria: parsedInput.memoria || null,
          disco: parsedInput.disco || null,
          garantia: parsedInput.garantia
            ? new Date(parsedInput.garantia)
            : null,
          manutencao: parsedInput.manutencao ?? false,
          localidadeNome: parsedInput.localidadeNome || null,
          usuarioNome: parsedInput.usuarioNome || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(computadoresTable.id, parsedInput.id));

      if (computadorExistente.length > 0) {
        await createLog({
          tipo: "computador",
          entidadeId: parsedInput.id,
          acao: "atualizado",
          descricao: `Computador atualizado: ${parsedInput.nome}`,
          dadosAnteriores: {
            nome: computadorExistente[0].nome,
            marca: computadorExistente[0].marca,
            modelo: computadorExistente[0].modelo,
            manutencao: computadorExistente[0].manutencao,
            localidadeNome: computadorExistente[0].localidadeNome,
            usuarioNome: computadorExistente[0].usuarioNome,
          },
          dadosNovos: {
            nome: parsedInput.nome,
            marca: parsedInput.marca,
            modelo: parsedInput.modelo,
            manutencao: parsedInput.manutencao ?? false,
            localidadeNome: parsedInput.localidadeNome,
            usuarioNome: parsedInput.usuarioNome,
          },
          updateUserId: session.user.id,
        });
      }
    } else {
      const nomeExistente = await db
        .select()
        .from(computadoresTable)
        .where(eq(computadoresTable.nome, parsedInput.nome))
        .limit(1);

      if (nomeExistente.length > 0) {
        throw new Error("Já existe um computador com este nome");
      }

      await db.insert(computadoresTable).values({
        id,
        nome: parsedInput.nome,
        marca: parsedInput.marca || null,
        modelo: parsedInput.modelo || null,
        processador: parsedInput.processador || null,
        memoria: parsedInput.memoria || null,
        disco: parsedInput.disco || null,
        garantia: parsedInput.garantia
          ? new Date(parsedInput.garantia)
          : null,
        manutencao: parsedInput.manutencao ?? false,
        localidadeNome: parsedInput.localidadeNome || null,
        usuarioNome: parsedInput.usuarioNome || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createLog({
        tipo: "computador",
        entidadeId: id,
        acao: "criado",
        descricao: `Computador criado: ${parsedInput.nome}`,
        dadosNovos: {
          nome: parsedInput.nome,
          marca: parsedInput.marca,
          modelo: parsedInput.modelo,
          manutencao: parsedInput.manutencao ?? false,
          localidadeNome: parsedInput.localidadeNome,
          usuarioNome: parsedInput.usuarioNome,
        },
        updateUserId: session.user.id,
      });
    }

    revalidatePath("/inventario/computadores");

    return {
      message: parsedInput.id
        ? "Computador atualizado com sucesso!"
        : "Computador cadastrado com sucesso!",
    };
  });

