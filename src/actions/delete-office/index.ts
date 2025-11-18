"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { officeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteOfficeSchema = z.object({
  id: z.string(),
});

export const deleteOffice = actionClient
  .schema(deleteOfficeSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    await db
      .delete(officeTable)
      .where(eq(officeTable.id, parsedInput.id));

    revalidatePath("/inventario/office");

    return {
      success: true,
      message: "Licença Office excluída com sucesso!",
    };
  });

