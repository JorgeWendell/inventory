"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { camerasTable, camerasUsuariosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertCameraSchema } from "./schema";

export const upsertCamera = actionClient
  .schema(upsertCameraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const id = parsedInput.id || crypto.randomUUID();

    if (parsedInput.id) {
      const cameraExistente = await db
        .select()
        .from(camerasTable)
        .where(eq(camerasTable.id, parsedInput.id))
        .limit(1);

      if (cameraExistente.length === 0) {
        throw new Error("Câmera não encontrada");
      }

      await db
        .update(camerasTable)
        .set({
          nome: parsedInput.nome,
          localidade: parsedInput.localidade || null,
          quantidadeCameras: parsedInput.quantidadeCameras,
          intelbrasId: parsedInput.intelbrasId || null,
          nobreakId: parsedInput.nobreakId || null,
          updateUserId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(camerasTable.id, parsedInput.id));

      await db
        .delete(camerasUsuariosTable)
        .where(eq(camerasUsuariosTable.cameraId, parsedInput.id));

      if (parsedInput.usuariosNome.length > 0) {
        await db.insert(camerasUsuariosTable).values(
          parsedInput.usuariosNome.map((usuarioNome) => ({
            id: crypto.randomUUID(),
            cameraId: parsedInput.id!,
            usuarioNome,
            createdAt: new Date(),
          })),
        );
      }
    } else {
      await db.insert(camerasTable).values({
        id,
        nome: parsedInput.nome,
        localidade: parsedInput.localidade || null,
        quantidadeCameras: parsedInput.quantidadeCameras,
        intelbrasId: parsedInput.intelbrasId || null,
        nobreakId: parsedInput.nobreakId || null,
        updateUserId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (parsedInput.usuariosNome.length > 0) {
        await db.insert(camerasUsuariosTable).values(
          parsedInput.usuariosNome.map((usuarioNome) => ({
            id: crypto.randomUUID(),
            cameraId: id,
            usuarioNome,
            createdAt: new Date(),
          })),
        );
      }
    }

    revalidatePath("/inventario/cameras");

    return {
      message: parsedInput.id
        ? "Câmera atualizada com sucesso!"
        : "Câmera cadastrada com sucesso!",
    };
  });

