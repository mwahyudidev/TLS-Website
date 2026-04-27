import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { AppError, errors } from "./errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(error: AppError | unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(error.toClient(), { status: error.status });
  }
  if (error instanceof ZodError) {
    const e = errors.validation("Validation failed", error.flatten().fieldErrors);
    return NextResponse.json(e.toClient(), { status: e.status });
  }
  // Don't leak internals
  console.error("[API] unhandled error:", error);
  const e = errors.internal();
  return NextResponse.json(e.toClient(), { status: e.status });
}

export async function parseJson<S extends ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw errors.validation("Invalid JSON body");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw errors.validation("Validation failed", result.error.flatten().fieldErrors);
  }
  return result.data;
}

export function parseQuery<S extends ZodTypeAny>(
  req: Request,
  schema: S,
): z.output<S> {
  const url = new URL(req.url);
  const obj: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  const result = schema.safeParse(obj);
  if (!result.success) {
    throw errors.validation(
      "Invalid query parameters",
      result.error.flatten().fieldErrors,
    );
  }
  return result.data;
}

// For routes where the body is optional (e.g. POST with no payload allowed).
// Returns the trimmed `notes` string or undefined if absent / invalid.
export async function maybeReadNotes(
  req: Request,
): Promise<string | undefined> {
  try {
    const body = (await req.json()) as { notes?: unknown };
    if (typeof body?.notes === "string" && body.notes.length <= 500) {
      return body.notes;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
