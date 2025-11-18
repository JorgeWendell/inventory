"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { nobreakTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

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

    await db
      .delete(nobreakTable)
      .where(eq(nobreakTable.id, parsedInput.id));

    revalidatePath("/inventario/nobreaks");

    return {
      success: true,
      message: "Nobreak excluído com sucesso!",
    };
  });

