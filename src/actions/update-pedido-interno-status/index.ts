"use server";

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

import { updatePedidoInternoStatusSchema } from "./schema";

export const updatePedidoInternoStatus = actionClient
  .schema(updatePedidoInternoStatusSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const pedido = await db
      .select()
      .from(pedidoInternoTable)
      .where(eq(pedidoInternoTable.id, parsedInput.id))
      .limit(1);

    if (pedido.length === 0) {
      throw new Error("Pedido não encontrado");
    }

    const pedidoAtual = pedido[0];

    // Se mudando para ENVIADO, reduzir estoque
    if (
      parsedInput.status === "ENVIADO" &&
      pedidoAtual.status !== "ENVIADO" &&
      pedidoAtual.status !== "RECEBIDO"
    ) {
      if (pedidoAtual.tipoProduto === "MATERIAL_TI") {
        const material = await db
          .select()
          .from(materiaisDeTiTable)
          .where(eq(materiaisDeTiTable.id, pedidoAtual.produtoId))
          .limit(1);

        if (material.length > 0) {
          const materialAtual = material[0];
          const novoEstoqueAtual =
            (materialAtual.estoqueAtual || 0) - pedidoAtual.quantidade;
          const novaQuantidade =
            (materialAtual.quantidade || 0) - pedidoAtual.quantidade;

          await db
            .update(materiaisDeTiTable)
            .set({
              estoqueAtual: Math.max(0, novoEstoqueAtual),
              quantidade: Math.max(0, novaQuantidade),
              updatedAt: new Date(),
            })
            .where(eq(materiaisDeTiTable.id, pedidoAtual.produtoId));
        }
      } else if (pedidoAtual.tipoProduto === "TONER") {
        const toner = await db
          .select()
          .from(tonerTable)
          .where(eq(tonerTable.id, pedidoAtual.produtoId))
          .limit(1);

        if (toner.length > 0) {
          const tonerAtual = toner[0];
          const novoEstoqueAtual =
            (tonerAtual.estoqueAtual || 0) - pedidoAtual.quantidade;

          await db
            .update(tonerTable)
            .set({
              estoqueAtual: Math.max(0, novoEstoqueAtual),
              updatedAt: new Date(),
            })
            .where(eq(tonerTable.id, pedidoAtual.produtoId));
        }
      }
    }

    // Preparar dados de atualização
    const updateData: {
      status: typeof parsedInput.status;
      updateUserId: string;
      updatedAt: Date;
      enviadoPor?: string | null;
      dataEnvio?: string | null;
      recebidoPor?: string | null;
      dataRecebimento?: string | null;
    } = {
      status: parsedInput.status,
      updateUserId: session.user.id,
      updatedAt: new Date(),
    };

    // Se mudando para ENVIADO, salvar dados de envio
    if (parsedInput.status === "ENVIADO") {
      updateData.enviadoPor = parsedInput.enviadoPor || null;
      updateData.dataEnvio = parsedInput.dataEnvio || null;
      // Limpar dados de recebimento se existirem
      if (pedidoAtual.status === "RECEBIDO") {
        updateData.recebidoPor = null;
        updateData.dataRecebimento = null;
      }
    }
    // Se mudando para RECEBIDO, salvar dados de recebimento
    else if (parsedInput.status === "RECEBIDO") {
      updateData.recebidoPor = parsedInput.recebidoPor || null;
      updateData.dataRecebimento = parsedInput.dataRecebimento || null;
    }
    // Se mudando para outro status, limpar dados de envio e recebimento
    else {
      updateData.enviadoPor = null;
      updateData.dataEnvio = null;
      updateData.recebidoPor = null;
      updateData.dataRecebimento = null;
    }

    // Atualizar status do pedido
    await db
      .update(pedidoInternoTable)
      .set(updateData)
      .where(eq(pedidoInternoTable.id, parsedInput.id));

    // Registrar log
    await createLog({
      tipo: "pedido_interno",
      entidadeId: parsedInput.id,
      acao: "status_alterado",
      descricao: `Status alterado de ${pedidoAtual.status} para ${parsedInput.status}`,
      dadosAnteriores: {
        status: pedidoAtual.status,
        enviadoPor: pedidoAtual.enviadoPor,
        dataEnvio: pedidoAtual.dataEnvio,
        recebidoPor: pedidoAtual.recebidoPor,
        dataRecebimento: pedidoAtual.dataRecebimento,
      },
      dadosNovos: {
        status: parsedInput.status,
        enviadoPor: updateData.enviadoPor,
        dataEnvio: updateData.dataEnvio,
        recebidoPor: updateData.recebidoPor,
        dataRecebimento: updateData.dataRecebimento,
      },
      updateUserId: session.user.id,
    });

    revalidatePath("/solicitacoes/pedido-interno");
    if (pedidoAtual.tipoProduto === "MATERIAL_TI") {
      revalidatePath("/estoque/materiais-de-ti");
    } else if (pedidoAtual.tipoProduto === "TONER") {
      revalidatePath("/inventario/toners");
    }

    return {
      message: "Status atualizado com sucesso!",
    };
  });

