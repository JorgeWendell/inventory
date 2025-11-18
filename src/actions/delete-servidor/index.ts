"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { servidorTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteServidorSchema = z.object({
  id: z.string(),
});

export const deleteServidor = actionClient
  .schema(deleteServidorSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    await db
      .delete(servidorTable)
      .where(eq(servidorTable.id, parsedInput.id));

    revalidatePath("/inventario/servidores");

    return {
      success: true,
      message: "Servidor excluído com sucesso!",
    };
  });

