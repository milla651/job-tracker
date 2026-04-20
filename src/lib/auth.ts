import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const nextAuthResult = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        verificationToken: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const email = credentials.email as string;

        // Allow login with verification token
        if (credentials.verificationToken) {
          const token = credentials.verificationToken as string;
          
          const verificationToken = await db.verificationToken.findFirst({
            where: {
              email,
              token,
            },
          });

          if (!verificationToken || new Date(verificationToken.expires) < new Date()) {
            return null;
          }

          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }

        if (!credentials.password) {
          return null;
        }

        const password = credentials.password as string;

        let user: any;
        try {
          user = await db.user.findUnique({ where: { email } });
        } catch (err: unknown) {
          console.error("[auth] DB lookup failed:", err instanceof Error ? err.message : err);
          return null;
        }

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuthResult;

export const auth: typeof nextAuthResult.auth = (...args: any[]) => {
  const result = (nextAuthResult.auth as any)(...args);
  if (result && typeof result.catch === "function") {
    return result.catch((error: any) => {
      if (error?.name === "JWTSessionError" || error?.message?.includes("JWTSessionError")) {
        console.warn("JWTSessionError caught, returning null session");
        return null;
      }
      throw error;
    });
  }
  return result;
};
