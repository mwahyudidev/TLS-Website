import { integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Unix seconds. Defaults to "now" via SQLite expression.
export const timestamp = (name: string) =>
  integer(name, { mode: "number" }).notNull().default(sql`(unixepoch())`);

export const nullableTimestamp = (name: string) =>
  integer(name, { mode: "number" });
