"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  solicitacaoCompraCotacaoTable,
  solicitacaoCompraTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { markSolicitacaoCompraCompradoSchema } from "./schema";

export const markSolicitacaoCompraComprado = actionClient
  .schema(markSolicitacaoCompraCompradoSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const solicitacao = await db
      .select()
      .from(solicitacaoCompraTable)
      .where(eq(solicitacaoCompraTable.id, parsedInput.id))
      .limit(1);

    if (solicitacao.length === 0) {
      throw new Error("Solicitação não encontrada");
    }

    const cotacao = await db
      .select({
        id: solicitacaoCompraCotacaoTable.id,
        fornecedorNome: solicitacaoCompraCotacaoTable.fornecedorNome,
      })
      .from(solicitacaoCompraCotacaoTable)
      .where(
        and(
          eq(
            solicitacaoCompraCotacaoTable.id,
            parsedInput.cotacaoId,
          ),
          eq(
            solicitacaoCompraCotacaoTable.solicitacaoCompraId,
            parsedInput.id,
          ),
        ),
      )
      .limit(1);

    if (cotacao.length === 0) {
      throw new Error("Cotação inválida para esta solicitação");
    }

    await db
      .update(solicitacaoCompraTable)
      .set({
        status: "COMPRADO",
        cotacaoSelecionadaId: parsedInput.cotacaoId,
        updateUserId: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(solicitacaoCompraTable.id, parsedInput.id));

    await createLog({
      tipo: "solicitacao_compra",
      entidadeId: parsedInput.id,
      acao: "status_alterado",
      descricao: `Solicitação marcada como comprada. Fornecedor: ${cotacao[0].fornecedorNome}`,
      dadosAnteriores: {
        status: solicitacao[0].status,
        cotacaoSelecionadaId: solicitacao[0].cotacaoSelecionadaId,
      },
      dadosNovos: {
        status: "COMPRADO",
        cotacaoSelecionadaId: parsedInput.cotacaoId,
      },
      updateUserId: session.user.id,
    });

    revalidatePath("/solicitacoes/solicitacao-de-compra");

    return {
      message: "Solicitação marcada como comprada",
    };
  });


