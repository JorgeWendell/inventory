"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { tonerTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

const deleteTonerSchema = z.object({
  id: z.string(),
});

export const deleteToner = actionClient
  .schema(deleteTonerSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const toner = await db
      .select()
      .from(tonerTable)
      .where(eq(tonerTable.id, parsedInput.id))
      .limit(1);

    if (toner.length > 0) {
      await createLog({
        tipo: "toner",
        entidadeId: parsedInput.id,
        acao: "deletado",
        descricao: `Toner deletado: ${toner[0].nome}`,
        dadosAnteriores: {
          nome: toner[0].nome,
          cor: toner[0].cor,
          estoqueMin: toner[0].estoqueMin,
          estoqueAtual: toner[0].estoqueAtual,
          localidadeNome: toner[0].localidadeNome,
          impressoraNome: toner[0].impressoraNome,
        },
        updateUserId: session.user.id,
      });
    }

    await db
      .delete(tonerTable)
      .where(eq(tonerTable.id, parsedInput.id));

    revalidatePath("/inventario/toners");

    return {
      success: true,
      message: "Toner excluído com sucesso!",
    };
  });

