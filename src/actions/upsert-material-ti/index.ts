"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { materiaisDeTiTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { upsertMaterialTiSchema } from "./schema";

export const upsertMaterialTi = actionClient
  .schema(upsertMaterialTiSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    const nomeExistente = await db
      .select({
        id: materiaisDeTiTable.id,
      })
      .from(materiaisDeTiTable)
      .where(eq(materiaisDeTiTable.nome, parsedInput.nome))
      .limit(1);

    if (
      nomeExistente.length > 0 &&
      (!parsedInput.id || nomeExistente[0].id !== parsedInput.id)
    ) {
      throw new Error("Já existe um material com este nome");
    }

    if (parsedInput.id) {
      const materialAnterior = await db
        .select()
        .from(materiaisDeTiTable)
        .where(eq(materiaisDeTiTable.id, parsedInput.id))
        .limit(1);

      await db
        .update(materiaisDeTiTable)
        .set({
          nome: parsedInput.nome,
          categoria: parsedInput.categoria,
          quantidade: parsedInput.estoqueAtual,
          estoqueMin: parsedInput.estoqueMin,
          estoqueAtual: parsedInput.estoqueAtual,
          localidadeNome: parsedInput.localidadeNome || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(materiaisDeTiTable.id, parsedInput.id));

      if (materialAnterior.length > 0) {
        await createLog({
          tipo: "material_ti",
          entidadeId: parsedInput.id,
          acao: "atualizado",
          descricao: `Material atualizado: ${parsedInput.nome}`,
          dadosAnteriores: {
            nome: materialAnterior[0].nome,
            categoria: materialAnterior[0].categoria,
            estoqueMin: materialAnterior[0].estoqueMin,
            estoqueAtual: materialAnterior[0].estoqueAtual,
          },
          dadosNovos: {
            nome: parsedInput.nome,
            categoria: parsedInput.categoria,
            estoqueMin: parsedInput.estoqueMin,
            estoqueAtual: parsedInput.estoqueAtual,
          },
          updateUserId: session.user.id,
        });
      }
    } else {
      await db.insert(materiaisDeTiTable).values({
        id,
        nome: parsedInput.nome,
        categoria: parsedInput.categoria,
        quantidade: parsedInput.estoqueAtual,
        estoqueMin: parsedInput.estoqueMin,
        estoqueAtual: parsedInput.estoqueAtual,
        localidadeNome: parsedInput.localidadeNome || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createLog({
        tipo: "material_ti",
        entidadeId: id,
        acao: "criado",
        descricao: `Material criado: ${parsedInput.nome} (${parsedInput.categoria})`,
        dadosNovos: {
          nome: parsedInput.nome,
          categoria: parsedInput.categoria,
          estoqueMin: parsedInput.estoqueMin,
          estoqueAtual: parsedInput.estoqueAtual,
        },
        updateUserId: session.user.id,
      });
    }

    revalidatePath("/estoque/materiais-de-ti");

    return {
      message: parsedInput.id
        ? "Material atualizado com sucesso!"
        : "Material cadastrado com sucesso!",
    };
  });


