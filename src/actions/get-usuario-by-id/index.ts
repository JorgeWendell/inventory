"use server";

import { db } from "@/db";
import { usuarioTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUsuarioById(id: string) {
  const usuario = await db
    .select()
    .from(usuarioTable)
    .where(eq(usuarioTable.id, id))
    .limit(1);

  return usuario[0] || null;
}

