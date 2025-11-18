"use server";

import { db } from "@/db";
import { camerasTable, nobreakTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCamerasTable() {
  const cameras = await db
    .select({
      id: camerasTable.id,
      nome: camerasTable.nome,
      intelbrasId: camerasTable.intelbrasId,
      quantidadeCameras: camerasTable.quantidadeCameras,
      localidade: camerasTable.localidade,
      updateUserEmail: usersTable.email,
      nobreakMarca: nobreakTable.marca,
      nobreakModelo: nobreakTable.modelo,
    })
    .from(camerasTable)
    .leftJoin(usersTable, eq(camerasTable.updateUserId, usersTable.id))
    .leftJoin(nobreakTable, eq(camerasTable.nobreakId, nobreakTable.id))
    .orderBy(camerasTable.nome);

  return cameras.map((camera) => {
    const nobreakInfo = camera.nobreakMarca && camera.nobreakModelo
      ? `${camera.nobreakMarca} ${camera.nobreakModelo}`
      : camera.nobreakMarca || camera.nobreakModelo || "-";

    return {
      id: camera.id,
      nome: camera.nome,
      intelbrasId: camera.intelbrasId || "-",
      quantidadeCameras: camera.quantidadeCameras ?? 1,
      nobreak: nobreakInfo,
      localidade: camera.localidade || "-",
      editadoPor: camera.updateUserEmail || "-",
    };
  });
}

