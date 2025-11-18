"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const setFirstAdminSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

export const setFirstAdmin = actionClient
  .schema(setFirstAdminSchema)
  .action(async ({ parsedInput }) => {
    // Verificar se o usuário existe
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsedInput.email))
      .limit(1);

    if (user.length === 0) {
      throw new Error(`Usuário com email ${parsedInput.email} não encontrado`);
    }

    // Atualizar o role
    const result = await db
      .update(usersTable)
      .set({
        role: "ADMINISTRATOR",
        updatedAt: new Date(),
      })
      .where(eq(usersTable.email, parsedInput.email))
      .returning();

    if (result.length === 0) {
      throw new Error("Erro ao atualizar role do usuário");
    }

    return {
      message: `Usuário ${parsedInput.email} definido como ADMINISTRATOR com sucesso!`,
    };
  });

