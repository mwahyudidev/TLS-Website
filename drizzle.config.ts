import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
} satisfies Config;
