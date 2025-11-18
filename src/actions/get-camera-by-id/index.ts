"use server";

import { db } from "@/db";
import { camerasTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCameraById(id: string) {
  const camera = await db
    .select()
    .from(camerasTable)
    .where(eq(camerasTable.id, id))
    .limit(1);

  return camera[0] || null;
}

