"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  materiaisDeTiTable,
  solicitacaoCompraTable,
  tonerTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { createSolicitacaoCompraSchema } from "./schema";

export const createSolicitacaoCompra = actionClient
  .schema(createSolicitacaoCompraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    if (parsedInput.tipoProduto === "MATERIAL_TI") {
      if (!parsedInput.materialId) {
        throw new Error("Material é obrigatório");
      }

      const material = await db
        .select({
          id: materiaisDeTiTable.id,
        })
        .from(materiaisDeTiTable)
        .where(eq(materiaisDeTiTable.id, parsedInput.materialId))
        .limit(1);

      if (material.length === 0) {
        throw new Error("Material não encontrado");
      }
    } else if (parsedInput.tipoProduto === "TONER") {
      if (!parsedInput.tonerId) {
        throw new Error("Toner é obrigatório");
      }

      const toner = await db
        .select({
          id: tonerTable.id,
        })
        .from(tonerTable)
        .where(eq(tonerTable.id, parsedInput.tonerId))
        .limit(1);

      if (toner.length === 0) {
        throw new Error("Toner não encontrado");
      }
    }

    const id = crypto.randomUUID();

    await db.insert(solicitacaoCompraTable).values({
      id,
      tipoProduto: parsedInput.tipoProduto,
      materialId: parsedInput.materialId || null,
      tonerId: parsedInput.tonerId || null,
      cor: parsedInput.cor || null,
      quantidade: parsedInput.quantidade,
      status: "EM_ANDAMENTO",
      updateUserId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createLog({
      tipo: "solicitacao_compra",
      entidadeId: id,
      acao: "criado",
      descricao: `Solicitação de compra criada: ${parsedInput.quantidade}x ${parsedInput.tipoProduto === "MATERIAL_TI" ? "Material de TI" : "Toner"}`,
      dadosNovos: {
        tipoProduto: parsedInput.tipoProduto,
        quantidade: parsedInput.quantidade,
        status: "EM_ANDAMENTO",
      },
      updateUserId: session.user.id,
    });

    revalidatePath("/solicitacoes/solicitacao-de-compra");

    return {
      message: "Solicitação criada com sucesso!",
    };
  });


