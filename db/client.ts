import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_URL ?? "./db/data/store.db";
const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

// Ensure the directory exists
const dir = path.dirname(absPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Hot-reload safe singleton
declare global {
  var __sqlite: Database.Database | undefined;
}

export const sqlite =
  globalThis.__sqlite ??
  (() => {
    const conn = new Database(absPath);
    conn.pragma("journal_mode = WAL");
    conn.pragma("foreign_keys = ON");
    conn.pragma("synchronous = NORMAL");
    return conn;
  })();

if (process.env.NODE_ENV !== "production") {
  globalThis.__sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
export { schema };
