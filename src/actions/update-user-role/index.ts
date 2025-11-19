"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { z } from "zod";

const updateUserRoleSchema = z.object({
  userId: z.string().min(1, { message: "ID do usuário é obrigatório" }),
  role: z.enum(["VIEWER", "OPERATOR", "PURCHASER", "AUDITOR", "ADMINISTRATOR"]),
});

export const updateUserRole = actionClient
  .schema(updateUserRoleSchema)
  .action(async ({ parsedInput }) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        throw new Error("Não autorizado");
      }

      // Verificar se o usuário é administrador
      const currentUser = await db
        .select({ role: usersTable.role })
        .from(usersTable)
        .where(eq(usersTable.id, session.user.id))
        .limit(1);

      if (currentUser.length === 0) {
        throw new Error("Usuário não encontrado no banco de dados");
      }

      const currentUserRole = currentUser[0].role;
      if (currentUserRole !== "ADMINISTRATOR") {
        throw new Error(
          `Apenas administradores podem alterar roles. Seu role atual: ${currentUserRole || "não definido"}`,
        );
      }

      // Verificar se não está tentando alterar o próprio role
      if (parsedInput.userId === session.user.id) {
        throw new Error("Você não pode alterar seu próprio role");
      }

      // Verificar se o usuário alvo existe
      const targetUser = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, parsedInput.userId))
        .limit(1);

      if (targetUser.length === 0) {
        throw new Error("Usuário alvo não encontrado");
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
    } catch (error) {
      // Re-throw para que o actionClient capture corretamente
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro desconhecido ao atualizar role");
    }
  });

