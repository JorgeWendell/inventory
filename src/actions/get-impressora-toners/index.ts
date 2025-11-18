"use server";

import { db } from "@/db";
import { impressorasTonersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getImpressoraToners(impressoraId: string) {
  const toners = await db
    .select({
      tonerNome: impressorasTonersTable.tonerNome,
      quantidade: impressorasTonersTable.quantidade,
    })
    .from(impressorasTonersTable)
    .where(eq(impressorasTonersTable.impressoraId, impressoraId));

  return toners;
}

