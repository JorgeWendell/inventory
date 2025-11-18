"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { localidadeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteLocalidadeSchema = z.object({
  id: z.string(),
});

export const deleteLocalidade = actionClient
  .schema(deleteLocalidadeSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    await db
      .delete(localidadeTable)
      .where(eq(localidadeTable.id, parsedInput.id));

    revalidatePath("/inventario/localidades");

    return {
      success: true,
      message: "Localidade excluída com sucesso!",
    };
  });

