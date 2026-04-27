import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dbPath = process.env.DATABASE_URL ?? "./db/data/store.db";
const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
fs.mkdirSync(path.dirname(absPath), { recursive: true });

const sqlite = new Database(absPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: path.resolve(process.cwd(), "db/migrations") });
console.log("Migrations applied to", absPath);
sqlite.close();
