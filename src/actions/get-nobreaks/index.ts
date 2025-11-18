"use server";

import { db } from "@/db";
import { nobreakTable } from "@/db/schema";

export async function getNobreaks() {
  const nobreaks = await db
    .select({
      id: nobreakTable.id,
      marca: nobreakTable.marca,
      modelo: nobreakTable.modelo,
    })
    .from(nobreakTable)
    .orderBy(nobreakTable.marca);

  return nobreaks;
}

