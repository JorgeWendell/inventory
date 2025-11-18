"use server";

import { db } from "@/db";
import { impressoraTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getImpressoraById(id: string) {
  const impressora = await db
    .select()
    .from(impressoraTable)
    .where(eq(impressoraTable.id, id))
    .limit(1);

  return impressora[0] || null;
}

