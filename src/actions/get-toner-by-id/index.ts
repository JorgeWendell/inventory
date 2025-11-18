"use server";

import { db } from "@/db";
import { tonerTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getTonerById(id: string) {
  const toner = await db
    .select()
    .from(tonerTable)
    .where(eq(tonerTable.id, id))
    .limit(1);

  return toner[0] || null;
}

