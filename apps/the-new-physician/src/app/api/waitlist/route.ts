export const runtime = "edge";
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const LOCAL_JSON_PATH = '/Users/sonnyneo/.gemini/antigravity/scratch/substack-sync/waitlist_entries.json';

async function sendConfirmationEmail(email: string, score: number, answers: any[]) {
  // 1. Get Resend API Key dynamically from environment SMTP configuration
  const emailServer = process.env.EMAIL_SERVER || "";
  const match = emailServer.match(/smtp:\/\/resend:([^@]+)@/);
  const resendApiKey = match ? match[1] : "re_ie4yKiNR_JdWCkjZJ6hrAQZtwcM9Ea3z4";
  
  // 2. Get Email From address
  const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";
  
  // 3. Determine if they opted-in to the HiveIMR Global Pilot
  const isPilot = Array.isArray(answers) && answers.some(a => a.questionId === 99);
  
  // 4. Calculate Diagnosis Title and Text matching client metrics
  let diagnosisTitle = "";
  let diagnosisText = "";
  if (score <= 45) {
    diagnosisTitle = "Severe Institutional Entrapment";
    diagnosisText = "You are operating under maximum systemic strain. Institutional overrides have compromised your scheduling autonomy and clinical passion, placing you at immediate risk of identity depletion. You are running shifts to sustain a matrix, not a calling.";
  } else if (score <= 65) {
    diagnosisTitle = "Systemic Burnout & Friction";
    diagnosisText = "You have moderate leverage, but bureaucratic friction and structural locks occupy over half of your cognitive capacity. You have clinical authority but lack true operational freedom or financial anti-fragility.";
  } else if (score <= 85) {
    diagnosisTitle = "Emerging Sovereign Architect";
    diagnosisText = "You possess clear operational insight and have begun diversifying your intellectual capital. You are actively transitioning from an assembly-line healer to a system architect. Focus on decoupling your time from your license.";
  } else {
    diagnosisTitle = "Sovereign Clinical Leader";
    diagnosisText = "You have achieved clinical self-determination. You own your hours, leverage modern systems to eliminate bureaucratic friction, and operate entirely on your own terms, providing a beacon for other physicians.";
  }

  // 5. Build Pilot Section
  let pilotHtml = "";
  if (isPilot) {
    pilotHtml = `
      <div class="pilot-box">
        <div class="pilot-title">🚀 HiveIMR Global Pilot Application Received</div>
        <p class="pilot-text">
          Thank you for registering interest in the HiveIMR Global Pilot Program. Our team is actively reviewing your application.
        </p>
        <p class="pilot-text" style="margin-top: 10px;">
          HiveIMR is a revolutionary Clinical Operating Environment designed by The Hive to defend your clinical judgment, escape the billing-centric EMR architecture, and restore cognitive sovereignty to healthcare professionals. We are selecting a limited cohort of pioneering physicians for our private beta launch.
        </p>
      </div>
    `;
  }

  // 6. Build Solution Cards dynamically matching scoring alignment
  let solutionCards = "";
  if (score <= 65) {
    solutionCards = `
      <div class="card">
        <div class="card-title">Dr. Heather Fork's Career Transition Coaching</div>
        <p class="card-text">Unlock dynamic CME-eligible resources, transition blueprints, and direct career navigation strategies tailored to exit corporate burnout.</p>
        <a href="https://doctorscrossing.com/" target="_blank" class="btn">Explore Doctors Crossing</a>
      </div>
      <div class="card">
        <div class="card-title">Dr. John Jurica's Nonclinical Academy & 70-Jobs Checklist</div>
        <p class="card-text">Gain access to the full checklist of nonclinical career roles and join NewScript, a private, ad-free online community built for transitioning clinicians.</p>
        <a href="https://nonclinicalphysicians.com/" target="_blank" class="btn">Explore Nonclinical Academy</a>
      </div>
    `;
  } else {
    solutionCards = `
      <div class="card">
        <div class="card-title">Dutch Rojas' Direct Contracting & Capital Systems</div>
        <p class="card-text">Master the mechanics of direct cash-pay surgical contracts, sovereign hospital ownership, and escaping standard corporate commercial insurance.</p>
        <a href="https://dutchrojas.substack.com/" target="_blank" class="btn">Read The Rojas Report</a>
      </div>
      <div class="card">
        <div class="card-title">Dr. Vernon Williams' B-ASE Brain Training Program</div>
        <p class="card-text">Accelerate accuracy, speed, and endurance while eliminating cognitive depletion caused by administrative workflows and corporate EHR exhaustion.</p>
        <a href="https://www.vernonwilliamsmd.com/" target="_blank" class="btn">Explore B-ASE Brain Program</a>
      </div>
    `;
  }

  // 7. Inject into beautiful glassmorphic dark email template
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      background-color: #0b0f19;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #161b26;
      border: 1px solid #d4af37;
      border-radius: 16px;
      padding: 40px 30px;
      box-sizing: border-box;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #d4af37;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.15em;
      margin: 0;
      text-transform: uppercase;
    }
    .badge {
      display: inline-block;
      border: 1px solid rgba(212, 175, 55, 0.3);
      background-color: rgba(212, 175, 55, 0.05);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #d4af37;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .score-container {
      text-align: center;
      margin-bottom: 35px;
      padding: 25px;
      background-color: #0d111a;
      border-radius: 12px;
      border: 1px solid #1f293d;
    }
    .score-title {
      font-size: 12px;
      font-weight: 700;
      color: #8f9cae;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .score-value {
      font-size: 48px;
      font-weight: 800;
      color: #d4af37;
      margin: 0;
      font-family: Courier, monospace;
    }
    .diagnosis-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 15px;
      margin-bottom: 8px;
    }
    .diagnosis-text {
      font-size: 14px;
      line-height: 1.6;
      color: #acb6c5;
      margin: 0;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 35px;
      margin-bottom: 15px;
      border-bottom: 1px solid #1f293d;
      padding-bottom: 8px;
    }
    .card {
      background-color: #0d111a;
      border: 1px solid rgba(212, 175, 55, 0.15);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
    }
    .card-text {
      font-size: 13px;
      line-height: 1.5;
      color: #acb6c5;
      margin: 0 0 15px 0;
    }
    .btn {
      display: inline-block;
      background-color: #d4af37;
      color: #0b0f19;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
    }
    .pilot-box {
      background-color: rgba(212, 175, 55, 0.05);
      border: 1px dashed #d4af37;
      border-radius: 12px;
      padding: 20px;
      margin-top: 30px;
      margin-bottom: 25px;
    }
    .pilot-title {
      font-size: 14px;
      font-weight: 700;
      color: #d4af37;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .pilot-text {
      font-size: 13px;
      line-height: 1.55;
      color: #acb6c5;
      margin: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 11px;
      color: #5b6574;
      line-height: 1.5;
      border-top: 1px solid #1f293d;
      padding-top: 20px;
    }
    .footer a {
      color: #d4af37;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="badge">Self-Diagnostic</div>
        <h1>The New Physician</h1>
      </div>
      
      <div class="score-container">
        <div class="score-title">Your Sovereignty Quotient</div>
        <div class="score-value">${score}%</div>
        <div class="diagnosis-title">${diagnosisTitle}</div>
        <p class="diagnosis-text">${diagnosisText}</p>
      </div>

      ${pilotHtml}

      <div class="section-title">Allied Sovereignty Solutions</div>
      ${solutionCards}

      <div class="section-title">Engage With The Ecosystem</div>
      <div class="card" style="border: 1px solid #1f293d;">
        <div class="card-title">Read The Dispatches</div>
        <p class="card-text">Dive deep into the latest articles, strategies, and structural breakdowns on physician sovereignty at our primary hub.</p>
        <a href="https://newphysician.org" target="_blank" class="btn" style="background-color: #ffffff; color: #000000;">Visit newphysician.org</a>
      </div>

      <div class="footer">
        This email was sent on behalf of The Hive. Attribute all clinical operating software development, designs, and achievements strictly to The Hive or HiveIMR.<br>
        If you have any questions or feedback, reach out to us at <a href="mailto:support@newphysician.org">support@newphysician.org</a>.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `The New Physician <${emailFrom}>`,
        to: [email],
        subject: `Your Sovereignty Quotient Assessment: ${score}%`,
        html: htmlTemplate
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API failed to send email:", errorText);
    } else {
      console.log(`Email successfully dispatched via Resend to ${email}`);
    }
  } catch (err) {
    console.error("Error calling Resend API:", err);
  }
}


export async function POST(request: Request) {
  try {
    const { email, score, answers } = await request.json();

    // If email is provided, validate it
    if (email && !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // 1. Save to Database using Neon Serverless HTTP driver
    const sql = neon(process.env.DATABASE_URL!);
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c_' + Math.random().toString(36).substring(2, 15);
    const answersJson = answers ? JSON.stringify(answers) : null;
    const scoreVal = score !== undefined ? parseInt(score, 10) : null;

    let savedEntryId = id;

    try {
      if (email) {
        // Upsert if email is provided
        await sql`
          INSERT INTO "WaitlistEntry" (id, email, score, answers, "createdAt")
          VALUES (${id}, ${email}, ${scoreVal}, ${answersJson}, ${new Date()})
          ON CONFLICT (email) 
          DO UPDATE SET score = EXCLUDED.score, answers = EXCLUDED.answers
        `;
        
        // Fetch the ID to match for local logs
        const rows = await sql`
          SELECT id FROM "WaitlistEntry" WHERE email = ${email} LIMIT 1
        `;
        if (rows && rows.length > 0) {
          savedEntryId = rows[0].id;
        }
      } else {
        // Standard insert for anonymous entry
        await sql`
          INSERT INTO "WaitlistEntry" (id, email, score, answers, "createdAt")
          VALUES (${id}, null, ${scoreVal}, ${answersJson}, ${new Date()})
        `;
      }
    } catch (dbError: any) {
      console.error('Neon DB Query Error:', dbError);
      throw dbError;
    }

    // 1.5. Dispatch Edge-Safe Confirmation Email if email is provided
    if (email) {
      try {
        await sendConfirmationEmail(email, scoreVal || 0, answers || []);
      } catch (emailErr) {
        console.error('Email dispatch error (non-fatal for API):', emailErr);
      }
    }

    // 2. Save locally to Sonny's Mac (waitlist_entries.json) during local development
    if (process.env.NODE_ENV === 'development') {
      try {
        const fsName = 'fs';
        const pathName = 'path';
        const fs = await import(fsName);
        const path = await import(pathName);

        const entryObj = {
          id: savedEntryId,
          email: email || 'Anonymous',
          score: score !== undefined ? parseInt(score, 10) : null,
          answers: answers || null,
          createdAt: new Date().toISOString(),
        };

        let currentEntries: any[] = [];
        if (fs.existsSync(LOCAL_JSON_PATH)) {
          try {
            const raw = fs.readFileSync(LOCAL_JSON_PATH, 'utf-8');
            currentEntries = JSON.parse(raw);
            if (!Array.isArray(currentEntries)) currentEntries = [];
          } catch (e) {
            console.error('Error parsing local waitlist JSON, resetting to empty array:', e);
            currentEntries = [];
          }
        } else {
          // Ensure directory exists
          const dir = path.dirname(LOCAL_JSON_PATH);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        }

        currentEntries.push(entryObj);
        fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(currentEntries, null, 2), 'utf-8');
      } catch (fsError) {
        console.error('FS local write error (non-fatal for API):', fsError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: email ? 'Added to waitlist' : 'Answers submitted anonymously' 
    });
  } catch (error: any) {
    console.error('Waitlist API Error:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
