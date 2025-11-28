"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { camerasTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createLog } from "@/actions/create-log";

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

    const camera = await db
      .select()
      .from(camerasTable)
      .where(eq(camerasTable.id, parsedInput.id))
      .limit(1);

    if (camera.length > 0) {
      await createLog({
        tipo: "camera",
        entidadeId: parsedInput.id,
        acao: "deletado",
        descricao: `Câmera deletada: ${camera[0].nome}`,
        dadosAnteriores: {
          nome: camera[0].nome,
          localidade: camera[0].localidade,
          quantidadeCameras: camera[0].quantidadeCameras,
          intelbrasId: camera[0].intelbrasId,
          nobreakId: camera[0].nobreakId,
        },
        updateUserId: session.user.id,
      });
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

