"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  solicitacaoCompraCotacaoTable,
  solicitacaoCompraTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { createSolicitacaoCompraCotacaoSchema } from "./schema";

export const createSolicitacaoCompraCotacao = actionClient
  .schema(createSolicitacaoCompraCotacaoSchema)
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
      })
      .from(solicitacaoCompraTable)
      .where(eq(solicitacaoCompraTable.id, parsedInput.solicitacaoCompraId))
      .limit(1);

    if (solicitacao.length === 0) {
      throw new Error("Solicitação não encontrada");
    }

    await db.insert(solicitacaoCompraCotacaoTable).values({
      id: crypto.randomUUID(),
      solicitacaoCompraId: parsedInput.solicitacaoCompraId,
      fornecedorNome: parsedInput.fornecedorNome,
      fornecedorCnpj: parsedInput.fornecedorCnpj || null,
      produtoDescricao: parsedInput.produtoDescricao,
      valor: parsedInput.valor.toFixed(2),
      quantidade: parsedInput.quantidade,
      prazoEntrega: parsedInput.prazoEntrega
        ? new Date(parsedInput.prazoEntrega)
        : null,
      updateUserId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/solicitacoes/solicitacao-de-compra");

    return {
      message: "Cotação adicionada com sucesso!",
    };
  });


