"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { nobreakTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

const deleteNobreakSchema = z.object({
  id: z.string(),
});

export const deleteNobreak = actionClient
  .schema(deleteNobreakSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const nobreak = await db
      .select()
      .from(nobreakTable)
      .where(eq(nobreakTable.id, parsedInput.id))
      .limit(1);

    if (nobreak.length > 0) {
      await createLog({
        tipo: "nobreak",
        entidadeId: parsedInput.id,
        acao: "deletado",
        descricao: `Nobreak deletado: ${nobreak[0].marca || ""} ${nobreak[0].modelo || ""}`.trim(),
        dadosAnteriores: {
          marca: nobreak[0].marca,
          modelo: nobreak[0].modelo,
          capacidade: nobreak[0].capacidade,
          localidadeNome: nobreak[0].localidadeNome,
          usuarioNome: nobreak[0].usuarioNome,
          computadoresNome: nobreak[0].computadoresNome,
        },
        updateUserId: session.user.id,
      });
    }

    await db
      .delete(nobreakTable)
      .where(eq(nobreakTable.id, parsedInput.id));

    revalidatePath("/inventario/nobreaks");

    return {
      success: true,
      message: "Nobreak excluído com sucesso!",
    };
  });

