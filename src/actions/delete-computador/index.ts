"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { computadoresTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

const deleteComputadorSchema = z.object({
  id: z.string(),
});

export const deleteComputador = actionClient
  .schema(deleteComputadorSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const computador = await db
      .select()
      .from(computadoresTable)
      .where(eq(computadoresTable.id, parsedInput.id))
      .limit(1);

    if (computador.length > 0) {
      await createLog({
        tipo: "computador",
        entidadeId: parsedInput.id,
        acao: "deletado",
        descricao: `Computador deletado: ${computador[0].nome}`,
        dadosAnteriores: {
          nome: computador[0].nome,
          marca: computador[0].marca,
          modelo: computador[0].modelo,
          manutencao: computador[0].manutencao,
          localidadeNome: computador[0].localidadeNome,
          usuarioNome: computador[0].usuarioNome,
        },
        updateUserId: session.user.id,
      });
    }

    await db
      .delete(computadoresTable)
      .where(eq(computadoresTable.id, parsedInput.id));

    revalidatePath("/inventario/computadores");

    return {
      success: true,
      message: "Computador excluído com sucesso!",
    };
  });

