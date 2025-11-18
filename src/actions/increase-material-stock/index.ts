"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { materiaisDeTiTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { increaseMaterialStockSchema } from "./schema";

export const increaseMaterialStock = actionClient
  .schema(increaseMaterialStockSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const material = await db
      .select({
        id: materiaisDeTiTable.id,
        estoqueAtual: materiaisDeTiTable.estoqueAtual,
      })
      .from(materiaisDeTiTable)
      .where(eq(materiaisDeTiTable.id, parsedInput.id))
      .limit(1);

    if (material.length === 0) {
      throw new Error("Material não encontrado");
    }

    const estoqueAnterior = material[0].estoqueAtual || 0;
    const novoEstoque = estoqueAnterior + parsedInput.amount;

    await db
      .update(materiaisDeTiTable)
      .set({
        estoqueAtual: novoEstoque,
        quantidade: novoEstoque,
        updateUserId: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(materiaisDeTiTable.id, parsedInput.id));

    await createLog({
      tipo: "material_ti",
      entidadeId: parsedInput.id,
      acao: "estoque_atualizado",
      descricao: `Estoque aumentado: +${parsedInput.amount} (${estoqueAnterior} → ${novoEstoque})`,
      dadosAnteriores: {
        estoqueAtual: estoqueAnterior,
      },
      dadosNovos: {
        estoqueAtual: novoEstoque,
      },
      updateUserId: session.user.id,
    });

    revalidatePath("/estoque/materiais-de-ti");

    return {
      message: "Estoque atualizado com sucesso!",
      estoqueAtual: novoEstoque,
    };
  });


