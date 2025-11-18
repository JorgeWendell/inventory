"use server";

import { db } from "@/db";
import { servidorTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getServidorById(id: string) {
  const servidor = await db
    .select()
    .from(servidorTable)
    .where(eq(servidorTable.id, id))
    .limit(1);

  return servidor[0] || null;
}

