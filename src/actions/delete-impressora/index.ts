"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { impressoraTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

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

    await db
      .delete(impressoraTable)
      .where(eq(impressoraTable.id, parsedInput.id));

    revalidatePath("/inventario/impressoras");

    return {
      success: true,
      message: "Impressora excluída com sucesso!",
    };
  });

