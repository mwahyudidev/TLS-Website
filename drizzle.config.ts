import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: { url: "./db/data/store.db" },
  verbose: true,
  strict: true,
} satisfies Config;
