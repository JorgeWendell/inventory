"use server";

import { db } from "@/db";
import { computadoresTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getComputadorById(id: string) {
  const computador = await db
    .select()
    .from(computadoresTable)
    .where(eq(computadoresTable.id, id))
    .limit(1);

  return computador[0] || null;
}

