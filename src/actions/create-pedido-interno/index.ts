"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  materiaisDeTiTable,
  pedidoInternoTable,
  tonerTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { createPedidoInternoSchema } from "./schema";

export const createPedidoInterno = actionClient
  .schema(createPedidoInternoSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    let categoria = "";

    if (parsedInput.tipoProduto === "MATERIAL_TI") {
      const material = await db
        .select({
          categoria: materiaisDeTiTable.categoria,
        })
        .from(materiaisDeTiTable)
        .where(eq(materiaisDeTiTable.id, parsedInput.produtoId))
        .limit(1);

      if (material.length === 0) {
        throw new Error("Material não encontrado");
      }

      categoria = material[0].categoria || "";
    } else if (parsedInput.tipoProduto === "TONER") {
      const toner = await db
        .select({
          cor: tonerTable.cor,
        })
        .from(tonerTable)
        .where(eq(tonerTable.id, parsedInput.produtoId))
        .limit(1);

      if (toner.length === 0) {
        throw new Error("Toner não encontrado");
      }

      categoria = "Toner";
    }

    const id = crypto.randomUUID();

    await db.insert(pedidoInternoTable).values({
      id,
      tipoProduto: parsedInput.tipoProduto,
      produtoId: parsedInput.produtoId,
      categoria,
      quantidade: parsedInput.quantidade,
      localidadeNome: parsedInput.localidadeNome || null,
      impressoraNome: parsedInput.impressoraNome || null,
      cor: parsedInput.cor || null,
      status: "AGUARDANDO",
      solicitanteId: session.user.id,
      updateUserId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createLog({
      tipo: "pedido_interno",
      entidadeId: id,
      acao: "criado",
      descricao: `Pedido interno criado: ${parsedInput.quantidade}x ${categoria}`,
      dadosNovos: {
        tipoProduto: parsedInput.tipoProduto,
        quantidade: parsedInput.quantidade,
        localidadeNome: parsedInput.localidadeNome,
        status: "AGUARDANDO",
      },
      updateUserId: session.user.id,
    });

    revalidatePath("/solicitacoes/pedido-interno");

    return {
      message: "Pedido interno criado com sucesso!",
    };
  });

