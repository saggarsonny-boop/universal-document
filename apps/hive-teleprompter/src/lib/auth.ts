import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
    {
      id: "email",
      type: "email",
      name: "Email",
      server: "",
      from: "",
      options: {},
      sendVerificationRequest: async ({ identifier, url }: { identifier: string; url: string }) => {
        const fromEmail = process.env.EMAIL_FROM || "auth@newphysician.org";
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.warn("⚠️ RESEND_API_KEY is not set in environment. Skipping email dispatch.");
          return;
        }

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: identifier,
            subject: `Sign in to Hive Teleprompter`,
            html: `<p>Sign in to your account by clicking the link below:</p><p><a href="${url}">${url}</a></p>`,
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Failed to send email verification via Resend API: ${response.statusText} - ${body}`);
        }
      },
    } as any,
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
