"use server";

import { db } from "@/db";
import { nobreakTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getNobreakById(id: string) {
  const nobreak = await db
    .select()
    .from(nobreakTable)
    .where(eq(nobreakTable.id, id))
    .limit(1);

  return nobreak[0] || null;
}

