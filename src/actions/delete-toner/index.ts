"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { tonerTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

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

    await db
      .delete(tonerTable)
      .where(eq(tonerTable.id, parsedInput.id));

    revalidatePath("/inventario/toners");

    return {
      success: true,
      message: "Toner excluído com sucesso!",
    };
  });

