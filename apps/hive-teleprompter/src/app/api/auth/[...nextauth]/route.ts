export const runtime = "edge";

let handler: any;

async function getHandler() {
  if (!handler) {
    const NextAuth = (await import("next-auth")).default;
    const { authOptions } = await import("@/lib/auth");
    handler = NextAuth(authOptions);
  }
  return handler;
}

export async function GET(req: any, res: any) {
  const h = await getHandler();
  return h(req, res);
}

export async function POST(req: any, res: any) {
  const h = await getHandler();
  return h(req, res);
}

