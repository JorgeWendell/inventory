"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { computadoresTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

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

    await db
      .delete(computadoresTable)
      .where(eq(computadoresTable.id, parsedInput.id));

    revalidatePath("/inventario/computadores");

    return {
      success: true,
      message: "Computador excluído com sucesso!",
    };
  });

