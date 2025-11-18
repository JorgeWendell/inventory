"use server";

import { db } from "@/db";
import { camerasTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRelatorioCameras() {
  const cameras = await db
    .select({
      nome: camerasTable.nome,
      localidade: camerasTable.localidade,
      quantidadeCameras: camerasTable.quantidadeCameras,
      intelbrasId: camerasTable.intelbrasId,
      nobreakId: camerasTable.nobreakId,
      updateUserName: usersTable.name,
    })
    .from(camerasTable)
    .leftJoin(usersTable, eq(camerasTable.updateUserId, usersTable.id));

  return cameras.map((c) => ({
    nome: c.nome,
    localidade: c.localidade || "N/A",
    quantidadeCameras: c.quantidadeCameras || 1,
    intelbrasId: c.intelbrasId || "N/A",
    nobreakId: c.nobreakId || "N/A",
    atualizadoPor: c.updateUserName || "N/A",
  }));
}

