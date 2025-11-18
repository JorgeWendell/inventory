"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  acessosDepartamentosTable,
  acessosDepartamentosUsuariosTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAcessoDepartamentoSchema } from "./schema";

export const upsertAcessoDepartamento = actionClient
  .schema(upsertAcessoDepartamentoSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const acessoExistente = await db
        .select()
        .from(acessosDepartamentosTable)
        .where(eq(acessosDepartamentosTable.id, parsedInput.id))
        .limit(1);

      if (acessoExistente.length === 0) {
        throw new Error("Acesso não encontrado");
      }

      await db
        .update(acessosDepartamentosTable)
        .set({
          usuarioLogin: parsedInput.usuarioLogin,
          computadorNome: parsedInput.computadorNome,
          pastaDepartamentos: parsedInput.pastaDepartamentos,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(acessosDepartamentosTable.id, parsedInput.id));

      await db
        .delete(acessosDepartamentosUsuariosTable)
        .where(
          eq(
            acessosDepartamentosUsuariosTable.acessoDepartamentoId,
            parsedInput.id,
          ),
        );

      if (parsedInput.usuariosNome.length > 0) {
        await db.insert(acessosDepartamentosUsuariosTable).values(
          parsedInput.usuariosNome.map((usuarioNome) => ({
            id: crypto.randomUUID(),
            acessoDepartamentoId: parsedInput.id!,
            usuarioNome,
            createdAt: new Date(),
          })),
        );
      }
    } else {
      await db.insert(acessosDepartamentosTable).values({
        id,
        usuarioLogin: parsedInput.usuarioLogin,
        computadorNome: parsedInput.computadorNome,
        pastaDepartamentos: parsedInput.pastaDepartamentos,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (parsedInput.usuariosNome.length > 0) {
        await db.insert(acessosDepartamentosUsuariosTable).values(
          parsedInput.usuariosNome.map((usuarioNome) => ({
            id: crypto.randomUUID(),
            acessoDepartamentoId: id,
            usuarioNome,
            createdAt: new Date(),
          })),
        );
      }
    }

    revalidatePath("/inventario/acessos-departamentos");

    return {
      message: parsedInput.id
        ? "Acesso atualizado com sucesso!"
        : "Acesso cadastrado com sucesso!",
    };
  });

