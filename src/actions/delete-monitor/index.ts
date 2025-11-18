"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { monitorTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

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

    await db
      .delete(monitorTable)
      .where(eq(monitorTable.id, parsedInput.id));

    revalidatePath("/inventario/monitores");

    return {
      success: true,
      message: "Monitor excluído com sucesso!",
    };
  });

