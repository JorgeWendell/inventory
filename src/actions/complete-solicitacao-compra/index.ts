"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  materiaisDeTiTable,
  solicitacaoCompraCotacaoTable,
  solicitacaoCompraTable,
  tonerTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { completeSolicitacaoCompraSchema } from "./schema";

export const completeSolicitacaoCompra = actionClient
  .schema(completeSolicitacaoCompraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const solicitacao = await db
      .select({
        id: solicitacaoCompraTable.id,
        tipoProduto: solicitacaoCompraTable.tipoProduto,
        status: solicitacaoCompraTable.status,
        quantidade: solicitacaoCompraTable.quantidade,
        materialId: solicitacaoCompraTable.materialId,
        tonerId: solicitacaoCompraTable.tonerId,
        cotacaoSelecionadaId: solicitacaoCompraTable.cotacaoSelecionadaId,
      })
      .from(solicitacaoCompraTable)
      .where(eq(solicitacaoCompraTable.id, parsedInput.id))
      .limit(1);

    if (solicitacao.length === 0) {
      throw new Error("Solicitação não encontrada");
    }

    if (solicitacao[0].status === "CONCLUIDO") {
      throw new Error("Solicitação já foi concluída");
    }

    let quantidadeRecebida = solicitacao[0].quantidade;

    if (solicitacao[0].cotacaoSelecionadaId) {
      const cotacao = await db
        .select({
          quantidade: solicitacaoCompraCotacaoTable.quantidade,
        })
        .from(solicitacaoCompraCotacaoTable)
        .where(
          eq(
            solicitacaoCompraCotacaoTable.id,
            solicitacao[0].cotacaoSelecionadaId,
          ),
        )
        .limit(1);
      if (cotacao.length > 0) {
        quantidadeRecebida = cotacao[0].quantidade;
      }
    }

    await db.transaction(async (tx) => {
      // Atualizar estoque baseado no tipo de produto
      if (
        solicitacao[0].tipoProduto === "MATERIAL_TI" &&
        solicitacao[0].materialId
      ) {
        const material = await tx
          .select({
            estoqueAtual: materiaisDeTiTable.estoqueAtual,
            quantidade: materiaisDeTiTable.quantidade,
          })
          .from(materiaisDeTiTable)
          .where(eq(materiaisDeTiTable.id, solicitacao[0].materialId))
          .limit(1);

        if (material.length === 0) {
          throw new Error("Material não encontrado");
        }

        await tx
          .update(materiaisDeTiTable)
          .set({
            estoqueAtual:
              (material[0].estoqueAtual ?? 0) + quantidadeRecebida,
            quantidade:
              (material[0].quantidade ?? 0) + quantidadeRecebida,
            updatedAt: new Date(),
          })
          .where(eq(materiaisDeTiTable.id, solicitacao[0].materialId));
      } else if (
        solicitacao[0].tipoProduto === "TONER" &&
        solicitacao[0].tonerId
      ) {
        const toner = await tx
          .select({
            estoqueAtual: tonerTable.estoqueAtual,
          })
          .from(tonerTable)
          .where(eq(tonerTable.id, solicitacao[0].tonerId))
          .limit(1);

        if (toner.length === 0) {
          throw new Error("Toner não encontrado");
        }

        await tx
          .update(tonerTable)
          .set({
            estoqueAtual:
              (toner[0].estoqueAtual ?? 0) + quantidadeRecebida,
            updatedAt: new Date(),
          })
          .where(eq(tonerTable.id, solicitacao[0].tonerId));
      }

      await tx
        .update(solicitacaoCompraTable)
        .set({
          status: "CONCLUIDO",
          recebidoPor: parsedInput.recebidoPor,
          dataRecebimento: new Date(parsedInput.dataRecebimento),
          numeroNotaFiscal: parsedInput.numeroNotaFiscal || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(solicitacaoCompraTable.id, parsedInput.id));
    });

    await createLog({
      tipo: "solicitacao_compra",
      entidadeId: parsedInput.id,
      acao: "status_alterado",
      descricao: `Solicitação concluída. Recebido por: ${parsedInput.recebidoPor}. Estoque atualizado.`,
      dadosAnteriores: {
        status: solicitacao[0].status,
      },
      dadosNovos: {
        status: "CONCLUIDO",
        recebidoPor: parsedInput.recebidoPor,
        dataRecebimento: parsedInput.dataRecebimento,
        numeroNotaFiscal: parsedInput.numeroNotaFiscal,
      },
      updateUserId: session.user.id,
    });

    revalidatePath("/solicitacoes/solicitacao-de-compra");
    if (solicitacao[0].tipoProduto === "MATERIAL_TI") {
      revalidatePath("/estoque/materiais-de-ti");
    } else if (solicitacao[0].tipoProduto === "TONER") {
      revalidatePath("/inventario/toners");
    }

    return { message: "Recebimento registrado e estoque atualizado" };
  });


