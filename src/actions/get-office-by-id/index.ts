"use server";

import { db } from "@/db";
import { officeTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOfficeById(id: string) {
  const office = await db
    .select()
    .from(officeTable)
    .where(eq(officeTable.id, id))
    .limit(1);

  return office[0] || null;
}

