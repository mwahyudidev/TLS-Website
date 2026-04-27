import "server-only";
import { sql, type SQL } from "drizzle-orm";
import type { ResultSet } from "@libsql/client";

type SQLRunner = {
  run(query: SQL): Promise<ResultSet>;
  all<T>(query: SQL): Promise<T[]>;
};

// Atomic UPSERT-and-increment using raw SQL within a Drizzle transaction.
// Format: TLS-YYYY-NNNNNN
export async function nextOrderNumber(tx: SQLRunner): Promise<string> {
  const year = new Date().getFullYear();

  await tx.run(
    sql`INSERT INTO order_number_seq (id, year, last_number)
        VALUES (1, ${year}, 0)
        ON CONFLICT(id) DO NOTHING`,
  );

  await tx.run(
    sql`UPDATE order_number_seq
        SET year = CASE WHEN year = ${year} THEN year ELSE ${year} END,
            last_number = CASE WHEN year = ${year} THEN last_number + 1 ELSE 1 END
        WHERE id = 1`,
  );

  const rows = await tx.all<{ year: number; last_number: number }>(
    sql`SELECT year, last_number FROM order_number_seq WHERE id = 1`,
  );

  const row = rows[0]!;
  const padded = String(row.last_number).padStart(6, "0");
  return `TLS-${row.year}-${padded}`;
}
