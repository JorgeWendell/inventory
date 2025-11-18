"use server";

import { db } from "@/db";
import { localidadeTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getLocalidadeById(id: string) {
  const localidade = await db
    .select()
    .from(localidadeTable)
    .where(eq(localidadeTable.id, id))
    .limit(1);

  return localidade[0] || null;
}

