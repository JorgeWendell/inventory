"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { acessosDepartamentosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteAcessoDepartamentoSchema = z.object({
  id: z.string(),
});

export const deleteAcessoDepartamento = actionClient
  .schema(deleteAcessoDepartamentoSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    await db
      .delete(acessosDepartamentosTable)
      .where(eq(acessosDepartamentosTable.id, parsedInput.id));

    revalidatePath("/inventario/acessos-departamentos");

    return {
      success: true,
      message: "Acesso a Departamento excluído com sucesso!",
    };
  });

