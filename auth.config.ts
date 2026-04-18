import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    // ✅ STAND DOWN: All routing logic is handled by proxy.ts.
    // This callback just approves everything — the middleware is the gatekeeper.
    authorized() {
      return true;
    },
  },
} satisfies NextAuthConfig;
