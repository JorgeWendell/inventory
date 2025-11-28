"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { impressoraTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

const deleteImpressoraSchema = z.object({
  id: z.string(),
});

export const deleteImpressora = actionClient
  .schema(deleteImpressoraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const impressora = await db
      .select()
      .from(impressoraTable)
      .where(eq(impressoraTable.id, parsedInput.id))
      .limit(1);

    if (impressora.length > 0) {
      await createLog({
        tipo: "impressora",
        entidadeId: parsedInput.id,
        acao: "deletado",
        descricao: `Impressora deletada: ${impressora[0].nome}`,
        dadosAnteriores: {
          nome: impressora[0].nome,
          marca: impressora[0].marca,
          modelo: impressora[0].modelo,
          manutencao: impressora[0].manutencao,
          localidadeNome: impressora[0].localidadeNome,
        },
        updateUserId: session.user.id,
      });
    }

    await db
      .delete(impressoraTable)
      .where(eq(impressoraTable.id, parsedInput.id));

    revalidatePath("/inventario/impressoras");

    return {
      success: true,
      message: "Impressora excluída com sucesso!",
    };
  });

