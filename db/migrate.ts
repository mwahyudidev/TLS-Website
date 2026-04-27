import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function main() {
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "db/migrations") });
  console.log("Migrations applied to", process.env.TURSO_DATABASE_URL);
  client.close();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  client.close();
  process.exit(1);
});
