import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const scripts = await prisma.script.findMany({
      // @ts-expect-error
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ scripts });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch scripts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  // @ts-expect-error
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();

    // Check Freemium Limits
    // @ts-expect-error
    if (session.user?.plan !== 'FOUNDER') {
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount > 500) {
        return NextResponse.json({ error: "LIMIT_REACHED_WORDS" }, { status: 403 });
      }

      // @ts-expect-error
      const scriptCount = await prisma.script.count({ where: { userId: session.user.id } });
      if (scriptCount >= 3) {
        return NextResponse.json({ error: "LIMIT_REACHED_CAPACITY" }, { status: 403 });
      }
    }

    const script = await prisma.script.create({
      data: {
        // @ts-expect-error
        userId: session.user.id,
        title: title || "Untitled Script",
        content,
      }
    });
    return NextResponse.json({ success: true, script });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save script" }, { status: 500 });
  }
}
