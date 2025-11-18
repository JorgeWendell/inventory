"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { solicitacaoCompraTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { updateSolicitacaoCompraCotacoesSchema } from "./schema";

export const updateSolicitacaoCompraCotacoes = actionClient
  .schema(updateSolicitacaoCompraCotacoesSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    await db
      .update(solicitacaoCompraTable)
      .set({
        cotacoesNotas: parsedInput.cotacoesNotas || null,
        updateUserId: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(solicitacaoCompraTable.id, parsedInput.id));

    revalidatePath("/solicitacoes/solicitacao-de-compra");

    return {
      message: "Cotações atualizadas com sucesso!",
    };
  });


