import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { normalizePassword } from "./course-policy";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return (
    salt +
    ":" +
    scryptSync(normalizePassword(password), salt, 32).toString("hex")
  );
}
export function matchesPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!/^[a-f0-9]{32}$/.test(salt || "") || !/^[a-f0-9]{64}$/.test(hash || ""))
    return false;
  return timingSafeEqual(
    scryptSync(normalizePassword(password), salt, 32),
    Buffer.from(hash, "hex"),
  );
}
