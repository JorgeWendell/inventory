import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";
import { usersTable } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    modelName: "usersTable",
    additionalFields: {
      role: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessionsTable",
    async onRead({ session, user }: { session: any; user: any }) {
      // Buscar o role do usuário do banco de dados
      const userData = await db
        .select({ role: usersTable.role })
        .from(usersTable)
        .where(eq(usersTable.id, user.id))
        .limit(1);

      return {
        ...session,
        user: {
          ...user,
          role: userData[0]?.role || "VIEWER",
        },
      };
    },
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://inventory.adelbr.tech",
    "http://inventory.adelbr.tech:3000",
    "http://192.168.15.12:3000",
  ],
  baseURL:
    process.env.NODE_ENV === "production"
      ? "http://inventory.adelbr.tech:3000"
      : "http://192.168.15.53:3000",
});
