import { hash, verify } from "@node-rs/argon2";

const opts = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, opts);
}

export async function verifyPassword(
  hashStr: string,
  plain: string,
): Promise<boolean> {
  try {
    return await verify(hashStr, plain, opts);
  } catch {
    return false;
  }
}
