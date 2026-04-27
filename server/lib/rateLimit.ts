import "server-only";
import { errors } from "./errors";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Simple in-memory token-bucket. Good enough for dev / small deployments.
// Replace with Redis/Upstash later if you scale horizontally.
export function rateLimit(
  key: string,
  opts: { limit: number; windowSeconds: number },
) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowSeconds * 1000 });
    return;
  }
  bucket.count += 1;
  if (bucket.count > opts.limit) {
    throw errors.rateLimited();
  }
}

export function clientIpFromRequest(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
