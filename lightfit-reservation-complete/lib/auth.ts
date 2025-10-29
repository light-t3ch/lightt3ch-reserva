
import { prisma } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { compare } from "bcryptjs";
import { z } from "zod";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = CredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const ok = await compare(password, user.password);
        return ok ? { id: user.id, email: user.email, name: user.name ?? undefined } : null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};
