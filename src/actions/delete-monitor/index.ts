"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { monitorTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

const deleteMonitorSchema = z.object({
  id: z.string(),
});

export const deleteMonitor = actionClient
  .schema(deleteMonitorSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const monitor = await db
      .select()
      .from(monitorTable)
      .where(eq(monitorTable.id, parsedInput.id))
      .limit(1);

    if (monitor.length > 0) {
      await createLog({
        tipo: "monitor",
        entidadeId: parsedInput.id,
        acao: "deletado",
        descricao: `Monitor deletado: ${monitor[0].marca || ""} ${monitor[0].modelo || ""}`.trim(),
        dadosAnteriores: {
          marca: monitor[0].marca,
          modelo: monitor[0].modelo,
          localidadeNome: monitor[0].localidadeNome,
          usuarioNome: monitor[0].usuarioNome,
        },
        updateUserId: session.user.id,
      });
    }

    await db
      .delete(monitorTable)
      .where(eq(monitorTable.id, parsedInput.id));

    revalidatePath("/inventario/monitores");

    return {
      success: true,
      message: "Monitor excluído com sucesso!",
    };
  });

