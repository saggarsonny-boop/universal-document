import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const getEvaluationTier = (scoreVal: number) => {
  if (scoreVal <= 25) {
    return {
      title: "Sovereign Clinician",
      impactStatement: "you have retained a high degree of clinical agency. Your practice prioritizes patient relationships over billing-driven templates. Safeguarding your sovereignty will require deliberate architectural isolation to prevent systemic encroachment."
    };
  } else if (scoreVal <= 50) {
    return {
      title: "Frictional Captive",
      impactStatement: "you are experiencing significant day-to-day administrative friction. While you actively fight for your clinical judgment, template constraints and EMR alerts are chipping away at your efficiency."
    };
  } else if (scoreVal <= 75) {
    return {
      title: "Algorithmic Prisoner",
      impactStatement: "the clinical software dictating your pace, documentation structure, and prescribing options is heavily managed by administrative quotas. You spend a substantial portion of your day feeding the database rather than focusing on healing."
    };
  } else {
    return {
      title: "Systemic Hostage",
      impactStatement: "your professional autonomy has been heavily restricted by EMR alerts, retrospective audit threats, and automated prior-authorization delays. Clinical choices are effectively routed through system compliance algorithms."
    };
  }
};

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
    const registration = await prisma.iMRPilotRegistration.create({
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

    // Parse answers for detailed email breakdown
    let answersObj: Record<string, number> = {};
    try {
      answersObj = typeof cleanAnswers === 'string' ? JSON.parse(cleanAnswers) : cleanAnswers || {};
    } catch (e) {
      console.warn('Failed to parse answers JSON for email:', e);
    }

    // Determine status tier and details
    const tier = getEvaluationTier(cleanScore);
    const lastName = name.trim().split(' ').pop() || name.trim();

    // Resend configuration
    const resendApiKey = process.env.RESEND_API_KEY || 're_ie4yKiNR_JdWCkjZJ6hrAQZtwcM9Ea3z4';
    const emailFrom = process.env.EMAIL_FROM || 'info@newphysician.org';

    // 1. Send Notification Email to hive@hive.baby
    const adminMailHtml = `
      <div style="font-family: monospace; background-color: #0b0b0b; color: #f5f5f5; padding: 30px; border-radius: 12px; border: 1px solid #333;">
        <h2 style="color: #D4AF37; margin-top: 0; font-family: sans-serif; border-bottom: 1px solid #222; padding-bottom: 10px;">
          [MOH Pilot Program] New Application Logged
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 180px;">Applicant Name:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #fff;">Dr. ${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Secure Email:</td>
            <td style="padding: 8px 0; color: #00bcd4; font-weight: bold;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Classification:</td>
            <td style="padding: 8px 0; color: #fff;">${practiceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Jurisdiction:</td>
            <td style="padding: 8px 0; color: #fff;">${stateCountry}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Subsidy Requested:</td>
            <td style="padding: 8px 0; color: ${meansTested ? '#10B981' : '#888'}; font-weight: bold;">
              ${meansTested ? 'YES (Means-Tested Subsidized Priority)' : 'NO'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Capture Score:</td>
            <td style="padding: 8px 0; color: #D4AF37; font-size: 20px; font-weight: bold;">${cleanScore}%</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Calibrated Tier:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #fff;">${tier.title}</td>
          </tr>
        </table>
        
        <h3 style="color: #D4AF37; border-top: 1px solid #222; padding-top: 15px; margin-top: 20px; font-family: sans-serif;">
          Raw Evaluation Answers:
        </h3>
        <ul style="padding-left: 20px; line-height: 1.6; font-size: 13px;">
          <li>Daily EMR Documentation Overhead: <strong>${answersObj['1'] ?? answersObj[1] ?? 'N/A'}%</strong></li>
          <li>Billing-Driven Note Structuring: <strong>${answersObj['2'] ?? answersObj[2] ?? 'N/A'}%</strong></li>
          <li>Retrospective Audit & Denial Anxiety: <strong>${answersObj['3'] ?? answersObj[3] ?? 'N/A'}%</strong></li>
          <li>EMR Workflow & Template Rigidity: <strong>${answersObj['4'] ?? answersObj[4] ?? 'N/A'}%</strong></li>
          <li>Insurance & Prior-Auth Overrides: <strong>${answersObj['5'] ?? answersObj[5] ?? 'N/A'}%</strong></li>
          <li>Professional Alienation & Burnout: <strong>${answersObj['6'] ?? answersObj[6] ?? 'N/A'}%</strong></li>
        </ul>
      </div>
    `;

    // 2. Send Premium HTML Confirmation to Candidate
    const candidateMailHtml = `
      <div style="font-family: sans-serif; background-color: #050505; color: #dddddd; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #1a1a1a; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 12px; background-color: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 50%; margin-bottom: 15px;">
            <span style="color: #D4AF37; font-size: 28px; font-weight: bold;">🛡️</span>
          </div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">
            Sovereignty Registration Confirmed
          </h1>
          <p style="color: #D4AF37; font-family: monospace; font-size: 11px; text-transform: uppercase; tracking-wider; margin-top: 5px;">
            HiveIMR Global Pilot Program
          </p>
        </div>

        <div style="background-color: #0c0c0c; border: 1px solid #222; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
          <p style="margin-top: 0; color: #ffffff; font-size: 16px;">
            Dear Dr. ${lastName},
          </p>
          <p style="line-height: 1.6; font-size: 14px; color: #aaaaaa;">
            Thank you for submitting your assessment for the **HiveIMR Global Pilot Program**. Taking this step indicates a commitment to reclaiming absolute professional agency and clinical focus for your patients.
          </p>
          
          <div style="border-top: 1px solid #1e1e1e; border-bottom: 1px solid #1e1e1e; padding: 20px 0; margin: 20px 0; text-align: center;">
            <p style="color: #888888; font-size: 12px; text-transform: uppercase; margin: 0 0 5px 0; font-family: monospace;">
              Certified Systemic Capture Score
            </p>
            <p style="color: #D4AF37; font-size: 48px; font-weight: bold; margin: 0; font-family: monospace; text-shadow: 0 0 10px rgba(212,175,55,0.2);">
              ${cleanScore}%
            </p>
            <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 5px 0 0 0;">
              Status: ${tier.title}
            </p>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #aaaaaa;">
            Your evaluation suggests that <strong>${tier.impactStatement}</strong>
          </p>
        </div>

        <div style="border-left: 3px solid #D4AF37; padding-left: 20px; margin-bottom: 30px;">
          <h3 style="color: #ffffff; font-size: 15px; margin-top: 0; margin-bottom: 8px;">
            What Happens Next:
          </h3>
          <ol style="padding-left: 20px; margin: 0; line-height: 1.7; font-size: 13px; color: #aaaaaa;">
            <li style="margin-bottom: 8px;">
              <strong style="color: #ffffff;">Database Registry:</strong> Your evaluation details have been encrypted and saved securely in our database.
            </li>
            <li style="margin-bottom: 8px;">
              <strong style="color: #ffffff;">Sandbox Provisioning:</strong> The HiveIMR Pilot integration team is actively reviewing your licensure state (<strong style="color: #ffffff;">${stateCountry}</strong>) and practice characteristics to set up your custom playground.
            </li>
            <li>
              <strong style="color: #ffffff;">Direct Secure Contact:</strong> A representative will reach out to this email address to initiate the onboarding protocols.
            </li>
          </ol>
        </div>

        <div style="border-top: 1px solid #1a1a1a; padding-top: 25px; text-align: center; color: #666666; font-size: 12px;">
          <p style="margin: 0;">
            To direct clinical care and the restoration of the oath.
          </p>
          <p style="margin: 5px 0 0 0; color: #888888;">
            <strong>The HiveIMR Pilot Team</strong>
          </p>
          <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 10px;">
            Secure Key: IMR-PILOT-${registration.id.toUpperCase()}-${cleanScore}
          </p>
        </div>
      </div>
    `;

    // Trigger emails in background (or sequence) using the configured Resend API
    try {
      await Promise.all([
        // Send alert to admin
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `The New Physician <${emailFrom}>`,
            to: ['hive@hive.baby'],
            subject: `[MOH Pilot Applicant] New Registration: Dr. ${lastName} (${cleanScore}%)`,
            html: adminMailHtml
          })
        }),
        // Send confirmation to applicant
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `The New Physician <${emailFrom}>`,
            to: [email.trim().toLowerCase()],
            subject: `[HiveIMR Global Pilot] Sovereignty Registration Confirmed`,
            html: candidateMailHtml
          })
        })
      ]);
      console.log('Successfully sent registration emails via Resend API.');
    } catch (mailError) {
      // Log the email failure but DO NOT fail the registration itself
      console.error('Failed to send registration notification emails:', mailError);
    }

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

