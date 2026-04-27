import "server-only";
import type { Database as BetterSqlite } from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

// Use raw SQL for an atomic UPSERT-and-increment.
// Format: TLS-YYYY-NNNNNN
export function nextOrderNumber(
  tx: BetterSQLite3Database<Record<string, unknown>>,
): string {
  const year = new Date().getFullYear();

  // Drizzle exposes the underlying raw client via $client (better-sqlite3 instance)
  const raw = (tx as unknown as { $client: BetterSqlite }).$client;

  // Ensure a row for the current year exists, then increment atomically.
  raw.transaction(() => {
    raw
      .prepare(
        `INSERT INTO order_number_seq (id, year, last_number)
         VALUES (1, ?, 0)
         ON CONFLICT(id) DO NOTHING`,
      )
      .run(year);

    raw
      .prepare(
        `UPDATE order_number_seq
         SET year = CASE WHEN year = ? THEN year ELSE ? END,
             last_number = CASE WHEN year = ? THEN last_number + 1 ELSE 1 END
         WHERE id = 1`,
      )
      .run(year, year, year);
  })();

  const row = raw
    .prepare(`SELECT year, last_number FROM order_number_seq WHERE id = 1`)
    .get() as { year: number; last_number: number };

  const padded = String(row.last_number).padStart(6, "0");
  return `TLS-${row.year}-${padded}`;
}
