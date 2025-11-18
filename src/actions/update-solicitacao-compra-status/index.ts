"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { solicitacaoCompraTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

import { updateSolicitacaoCompraStatusSchema } from "./schema";

export const updateSolicitacaoCompraStatus = actionClient
  .schema(updateSolicitacaoCompraStatusSchema)
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

    const solicitacaoAtual = solicitacao[0];

    await db
      .update(solicitacaoCompraTable)
      .set({
        status: parsedInput.status,
        ...(parsedInput.status !== "CONCLUIDO"
          ? {
              recebidoPor: null,
              dataRecebimento: null,
              numeroNotaFiscal: null,
            }
          : {}),
        updateUserId: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(solicitacaoCompraTable.id, parsedInput.id));

    await createLog({
      tipo: "solicitacao_compra",
      entidadeId: parsedInput.id,
      acao: "status_alterado",
      descricao: `Status alterado de ${solicitacaoAtual.status} para ${parsedInput.status}`,
      dadosAnteriores: {
        status: solicitacaoAtual.status,
      },
      dadosNovos: {
        status: parsedInput.status,
      },
      updateUserId: session.user.id,
    });

    revalidatePath("/solicitacoes/solicitacao-de-compra");

    return {
      message: "Status atualizado com sucesso!",
    };
  });


