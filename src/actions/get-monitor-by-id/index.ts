"use server";

import { db } from "@/db";
import { monitorTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getMonitorById(id: string) {
  const monitor = await db
    .select()
    .from(monitorTable)
    .where(eq(monitorTable.id, id))
    .limit(1);

  return monitor[0] || null;
}

