"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { camerasTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteCameraSchema = z.object({
  id: z.string(),
});

export const deleteCamera = actionClient
  .schema(deleteCameraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    await db
      .delete(camerasTable)
      .where(eq(camerasTable.id, parsedInput.id));

    revalidatePath("/inventario/cameras");

    return {
      success: true,
      message: "Câmera excluída com sucesso!",
    };
  });

