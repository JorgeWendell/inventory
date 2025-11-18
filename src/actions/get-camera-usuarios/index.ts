"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { camerasUsuariosTable } from "@/db/schema";

export async function getCameraUsuarios(cameraId: string) {
  const usuarios = await db
    .select({
      usuarioNome: camerasUsuariosTable.usuarioNome,
    })
    .from(camerasUsuariosTable)
    .where(eq(camerasUsuariosTable.cameraId, cameraId));

  return usuarios.map((u) => u.usuarioNome);
}

