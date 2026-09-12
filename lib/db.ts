import "server-only";
import { neon } from "@neondatabase/serverless";
export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Database is not configured");
  // HTTP queries: no persistent connection pool is needed on Vercel.
  return neon(url);
}
