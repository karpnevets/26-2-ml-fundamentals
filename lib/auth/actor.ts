import "server-only";
import { auth } from "@/auth";
import { authConfigured } from "./config";
import { adminEmail, schoolEmail } from "./policy";
import { database } from "@/lib/db";
export type Actor = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};
export async function currentActor(): Promise<Actor | null> {
  if (!authConfigured()) return null;
  const session = await auth();
  if (!session?.user?.id || !session.user.schoolVerified) return null;
  const sql = database();
  const rows =
    await sql`SELECT id,email,name FROM app_users WHERE id=${session.user.id}::uuid AND disabled_at IS NULL`;
  const row = rows[0];
  if (!row || !schoolEmail(row.email)) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name ?? ""),
    isAdmin: adminEmail(row.email, process.env.ADMIN_EMAILS),
  };
}
