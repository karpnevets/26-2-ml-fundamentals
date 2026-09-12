import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { allowedGoogleProfile, SCHOOL_DOMAIN } from "@/lib/auth/policy";
import { authConfigured } from "@/lib/auth/config";
import { database } from "@/lib/db";
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: "openid email profile",
          hd: SCHOOL_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ account, profile }) {
      return (
        authConfigured() && allowedGoogleProfile(account?.provider, profile)
      );
    },
    async jwt({ token, account, profile }) {
      if (account) {
        if (!allowedGoogleProfile(account.provider, profile))
          throw new Error("School account required");
        const sql = database();
        const rows = await sql`
          INSERT INTO app_users (google_sub,email,name,last_login_at)
          VALUES (${profile!.sub!},${profile!.email!.toLowerCase()},${typeof profile!.name === "string" ? profile!.name.slice(0, 200) : ""},now())
          ON CONFLICT (google_sub) DO UPDATE SET email=EXCLUDED.email,name=EXCLUDED.name,last_login_at=now()
          WHERE app_users.disabled_at IS NULL
          RETURNING id
        `;
        if (!rows[0]) throw new Error("Account unavailable");
        token.userId = String(rows[0].id);
        token.schoolVerified = true;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === "string" ? token.userId : "";
        session.user.schoolVerified = token.schoolVerified === true;
      }
      return session;
    },
  },
  logger: {
    error() {
      console.error(
        "Authentication failed. Check OAuth settings, school account eligibility, and database availability.",
      );
    },
  },
});
