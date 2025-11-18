"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

export async function getUsersWithRoles() {
  const users = await db.select().from(usersTable);

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role || "VIEWER") as
      | "VIEWER"
      | "OPERATOR"
      | "PURCHASER"
      | "AUDITOR"
      | "ADMINISTRATOR",
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));
}

