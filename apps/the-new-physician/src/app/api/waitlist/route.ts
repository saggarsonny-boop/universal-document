import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Insert into database
    await prisma.waitlistEntry.create({
      data: { email }
    });

    return NextResponse.json({ success: true, message: 'Added to waitlist' });
  } catch (error: any) {
    // If it's a unique constraint violation, they are already on the list, which is fine
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Already on waitlist' });
    }
    
    console.error('Waitlist API Error:', error);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}
