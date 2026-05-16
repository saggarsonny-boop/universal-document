import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER || "smtp://mock",
      from: process.env.EMAIL_FROM || "auth@newphysician.org",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        const user = await prisma.user.findUnique({ where: { id: token.sub } });
        // @ts-expect-error session user might not have an id string
        session.user.id = token.sub;
        // @ts-expect-error session user might not have a plan string
        session.user.plan = user?.plan || 'FOUNDER';
      }
      return session;
    },
  },
};
