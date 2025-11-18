"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { z } from "zod";

const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["VIEWER", "OPERATOR", "PURCHASER", "AUDITOR", "ADMINISTRATOR"]),
});

export const updateUserRole = actionClient
  .schema(updateUserRoleSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    // Verificar se o usuário é administrador
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0 || currentUser[0].role !== "ADMINISTRATOR") {
      throw new Error("Apenas administradores podem alterar roles");
    }

    // Verificar se não está tentando alterar o próprio role
    if (parsedInput.userId === session.user.id) {
      throw new Error("Você não pode alterar seu próprio role");
    }

    await db
      .update(usersTable)
      .set({
        role: parsedInput.role,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, parsedInput.userId));

    return {
      message: "Role atualizado com sucesso!",
    };
  });

