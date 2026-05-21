import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, practiceType, stateCountry, meansTested, systemicCaptureScore, answers } = body;

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || !email.includes('@') || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!practiceType || !['SOLO', 'CLINIC', 'SYSTEM'].includes(practiceType)) {
      return NextResponse.json({ error: 'Valid practice classification is required' }, { status: 400 });
    }

    if (!stateCountry || typeof stateCountry !== 'string' || stateCountry.trim() === '') {
      return NextResponse.json({ error: 'State / Country is required' }, { status: 400 });
    }

    const cleanScore = typeof systemicCaptureScore === 'number' ? Math.round(systemicCaptureScore) : 0;
    const cleanAnswers = answers ? (typeof answers === 'string' ? answers : JSON.stringify(answers)) : '{}';

    // Insert into Neon database using Prisma
    await prisma.iMRPilotRegistration.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        practiceType,
        stateCountry: stateCountry.trim(),
        meansTested: !!meansTested,
        systemicCaptureScore: cleanScore,
        answers: cleanAnswers
      }
    });

    return NextResponse.json({ success: true, message: 'Successfully registered for the HiveIMR Global Pilot Program' });
  } catch (error: any) {
    // Unique constraint violation in Prisma (P2002) for the email column
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'You have already registered for the Pilot Program' });
    }
    
    console.error('Pilot Registration API Error:', error);
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const passcode = searchParams.get('passcode');

    if (passcode !== 'MOH-PILOT-2026') {
      return NextResponse.json({ error: 'Unauthorized credentials required' }, { status: 401 });
    }

    const registrations = await prisma.iMRPilotRegistration.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error('Failed to fetch registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

