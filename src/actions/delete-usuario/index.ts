"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { usuarioTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteUsuarioSchema = z.object({
  id: z.string(),
});

export const deleteUsuario = actionClient
  .schema(deleteUsuarioSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    await db
      .delete(usuarioTable)
      .where(eq(usuarioTable.id, parsedInput.id));

    revalidatePath("/inventario/usuarios");

    return {
      success: true,
      message: "Usuário excluído com sucesso!",
    };
  });

