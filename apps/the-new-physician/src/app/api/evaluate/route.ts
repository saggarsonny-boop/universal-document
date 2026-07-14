import { NextResponse } from 'next/server';
import { dbEdge } from '@/lib/db-edge';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

function getCanonicalString(val: any): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) {
    return '[' + val.map(getCanonicalString).join(',') + ']';
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val).sort();
    const parts = keys.map(k => {
      return JSON.stringify(k) + ':' + getCanonicalString(val[k]);
    });
    return '{' + parts.join(',') + '}';
  }
  return JSON.stringify(val);
}

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

    // Insert into Neon database using dbEdge
    const uuid = globalThis.crypto.randomUUID();
    await dbEdge(`
      INSERT INTO imr_pilot_registrations 
      (id, name, email, practice_type, state_country, means_tested, systemic_capture_score, answers) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      uuid,
      name.trim(),
      email.trim().toLowerCase(),
      practiceType,
      stateCountry.trim(),
      !!meansTested,
      cleanScore,
      cleanAnswers
    ]);
    const registration = { id: uuid };

    // Parse answers for evaluation
    let answersObj: Record<string, number> = {};
    try {
      answersObj = typeof cleanAnswers === 'string' ? JSON.parse(cleanAnswers) : cleanAnswers || {};
    } catch (e) {
      console.warn('Failed to parse answers JSON:', e);
    }

    const tier = getEvaluationTier(cleanScore);
    const lastName = name.trim().split(' ').pop() || name.trim();

    // Call Gemini API dynamically
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    let blueprintText = '';
    let generatedFromAI = false;

    if (apiKey) {
      try {
        const geminiPrompt = `
Generate a personalized "Kintsugi Career Transition Blueprint" for a physician with the following profile:
- Name: Dr. ${name}
- Systemic Capture Score: ${cleanScore}% (Calibration Tier: ${tier.title})
- Practice Classification: ${practiceType}
- Licensure Jurisdiction: ${stateCountry}
- Means-tested Subsidy Requested: ${meansTested ? 'Yes' : 'No'}

Based on their answers to the Sovereignty Quiz (EMR burden: ${answersObj['1'] ?? 50}%, coding pressure: ${answersObj['2'] ?? 50}%, audit anxiety: ${answersObj['3'] ?? 50}%, template rigidity: ${answersObj['4'] ?? 50}%, prior-auth overrides: ${answersObj['5'] ?? 50}%, burnout level: ${answersObj['6'] ?? 50}%), analyze their systemic capture and write a 4-part transition blueprint. The response must be structured in plain text with clear headings, adhering to these sections:
### Part 1: Executive Summary
(Empathize with their current status, calm & direct assessment)
### Part 2: Current Systemic Exposure
(Analyze the impact of their capture score on their clinical agency)
### Part 3: High-Autonomy Alternatives
(Actionable alternative pathways - solo cash practices, direct primary care, consulting, active mention of Dutch Rojas for pricing agreements, Dr. Heather Fork or John Jurica for career coaching, and Vernon Williams for cognitive bandwidth)
### Part 4: Phase 1 Action Steps
(3-4 highly specific, immediate, practical milestones)

CRITICAL INSTRUCTIONS:
- You must write in a calm, direct, and slightly poetic professional human voice.
- STRICTLY AVOID any cliché AI boilerplate phrases or metaphors, such as "navigating the crucible", "shattering your clinical lens", "a paradigm shift", "beacon of hope", "tapestry", "delve", "testament", "journey", etc.
- STRICTLY DO NOT use em-dashes (— or --) under any circumstances. Use standard punctuation like colons, commas, or parentheses instead.
- Do not use markdown styling inside the section content; use plain, professional prose paragraphs.
`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: geminiPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        });

        if (res.ok) {
          const resData = await res.json();
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.includes('### Part')) {
            blueprintText = text;
            generatedFromAI = true;
          }
        }
      } catch (err) {
        console.error('Failed calling Gemini API:', err);
      }
    }

    // Graceful deterministic fallback
    if (!generatedFromAI) {
      const execSummaries = {
        "Sovereign Clinician": `Dr. ${lastName}, your score of ${cleanScore}% indicates that you have successfully defended your clinical boundaries. In the jurisdiction of ${stateCountry}, you represent a rare group of practitioners who have not let system billing templates dilute the physician-patient relationship. However, remaining independent within a consolidating market requires deliberate structural isolation.`,
        "Frictional Captive": `Dr. ${lastName}, your score of ${cleanScore}% shows that while your core clinical judgment remains intact, EMR alerts and administrative checklists are eating away at your daily energy. In a ${practiceType} environment, you are fighting a defensive battle. You are standing on the edge of the corporate capture trap, and without active intervention, administrative entropy will continue to override your focus.`,
        "Algorithmic Prisoner": `Dr. ${lastName}, your score of ${cleanScore}% indicates that the clinical software and coding rules are now directing your daily pace. You spend a substantial portion of your clinical hours feeding the database to satisfy administrative quotas rather than focusing on healing. Within ${stateCountry}, this level of digital surveillance causes severe cognitive fatigue.`,
        "Systemic Hostage": `Dr. ${lastName}, your score of ${cleanScore}% reveals a near-total loss of clinical agency. Your documentation, diagnostic coding, and medication selections are effectively routed through system compliance algorithms, prior-authorization blocks, and audit threats. Survival and professional recovery require a complete structural exit.`
      };

      const exposureDetails = {
        "SOLO": `As a solo practitioner, your primary vulnerability lies in the time-cost of regulatory compliance. Lacking the administrative scale of larger groups, you are forced to spend your own evenings auditing billing codes and fighting prior authorizations. This administrative tax reduces your direct care capacity and leaves you exposed to audits.`,
        "CLINIC": `In an independent group or clinic, you are caught between the escalating costs of overhead and the flat reimbursement rates of insurance contracts. This pressure forces your group to demand faster patient turnarounds, turning your clinical schedule into a high-volume treadmill where narrative precision is sacrificed for pre-formatted templates.`,
        "SYSTEM": `Within a large hospital or multi-specialty system, you are highly captured by automated templates and administrative benchmarks. The system monitors your electronic keyboard clicks, tracks your relative value units, and uses retrospective denials to force defensive charting. Your clinical judgment is subordinate to institutional compliance.`
      };

      const alternatives = `To reclaim control, you must shift from a system-dependent model to a high-autonomy architecture. First, consider exploring cash-pay agreements and direct contracting. Dutch Rojas provides pricing blueprints that allow doctors to contract directly with employers, bypassing insurance intermediaries. For transition guidance, Dr. Heather Fork offers practical coaching on escaping hospital contracts, while Dr. John Jurica provides actionable transition plans through the NewScript community. Finally, to protect your cognitive bandwidth from administrative overload, integrate the neuro-performance protocols developed by Dr. Vernon Williams.`;

      const actionSteps = [
        `Audit your EMR keyboard clicks and template usage. Identify two redundant checklists that can be safely eliminated to restore ten minutes of direct eye contact per patient encounter.`,
        `Map out a transition timeline to direct clinical care. Calculate your minimum financial overhead to determine what share of your current practice can be shifted to direct employer contracting.`,
        `Establish a cognitive bandwidth buffer. Implement science-backed neuro-performance protocols to insulate your focus and reduce administrative screen-fatigue during clinical shifts.`
      ];

      blueprintText = `
### Part 1: Executive Summary
${execSummaries[tier.title as keyof typeof execSummaries] || execSummaries["Frictional Captive"]}

### Part 2: Current Systemic Exposure
${exposureDetails[practiceType as keyof typeof exposureDetails] || exposureDetails["SOLO"]}
The data suggests your daily workflow is heavily impacted by systemic rules. The threat of audits and retrospective denials forces a defensive documentation style that consumes your cognitive energy.

### Part 3: High-Autonomy Alternatives
${alternatives}

### Part 4: Phase 1 Action Steps
${actionSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n\n')}
`;
    }

    // Build compliant iSDF v0.1.0 Universal Document Sealed (UDS) object
    const documentUuid = globalThis.crypto.randomUUID();
    const isoNow = new Date().toISOString();

    const metadata = {
      "id": documentUuid,
      "title": `Kintsugi Career Transition Blueprint - Dr. ${lastName}`,
      "created_at": isoNow,
      "updated_at": isoNow,
      "created_by": "The Hive IMR Registry",
      "organisation": "HiveIMR",
      "document_type": "consultation_blueprint",
      "tags": ["IMR", "Sovereignty", "Kintsugi", "CareerBlueprint"],
      "revoked": false,
      "visual_identity": {
        "role": "sealed",
        "watermark_hex": "#D4AF37",
        "watermark_tone": "gold",
        "file_metadata": {
          "format_family": "consultation",
          "extension_hint": "uds"
        },
        "icon": {
          "desktop": "badge_gold",
          "finder_preview": "kintsugi_gold",
          "explorer_preview": "kintsugi_gold",
          "preview_pane": "kintsugi_gold"
        }
      },
      "viral_links": {
        "open_in_reader": "https://reader.hive.baby",
        "convert_to_uds": "https://converter.hive.baby",
        "create_udr": "https://creator.hive.baby"
      }
    };

    const manifest = {
      "base_language": "en",
      "language_manifest": [
        { "code": "en", "label": "English" }
      ],
      "clarity_layer_manifest": [
        { "id": "executive", "label": "Executive Summary" },
        { "id": "clinical", "label": "Clinical Detail" }
      ],
      "permissions": {
        "allow_copy": true,
        "allow_print": true,
        "allow_export": true,
        "require_auth": false
      }
    };

    const blocks: any[] = [];
    blocks.push({
      "id": "b_heading_0",
      "type": "heading",
      "base_content": { "text": `KINTSUGI CAREER TRANSITION BLUEPRINT`, "level": 1 }
    });
    blocks.push({
      "id": "b_subheading_0",
      "type": "heading",
      "base_content": { "text": `Prepared for Dr. ${name} · Calibration: ${tier.title} (${cleanScore}%)`, "level": 3 }
    });
    blocks.push({
      "id": "b_divider_0",
      "type": "divider",
      "base_content": {}
    });

    // Parse the 4 parts to build compliant block items
    const parts = blueprintText.split(/### Part \d+:?\s*/i);
    let blockIdx = 1;
    const partTitles = [
      "Executive Summary",
      "Current Systemic Exposure",
      "High-Autonomy Alternatives",
      "Phase 1 Action Steps"
    ];

    for (let i = 1; i < parts.length; i++) {
      const content = parts[i].trim();
      if (!content) continue;

      const title = partTitles[i - 1] || `Section ${i}`;

      blocks.push({
        "id": `b_h_${blockIdx++}`,
        "type": "heading",
        "base_content": { "text": title, "level": 2 }
      });

      const items = content.split('\n\n');
      for (const item of items) {
        const trimmed = item.trim();
        if (!trimmed) continue;

        if (/^\d+\.\s+/.test(trimmed) || /^\d+\)\s+/.test(trimmed)) {
          const listItems = trimmed.split('\n').map(li => li.replace(/^\d+[\.\)]\s+/, '').trim()).filter(Boolean);
          blocks.push({
            "id": `b_l_${blockIdx++}`,
            "type": "list",
            "base_content": {
              "items": listItems,
              "ordered": true
            }
          });
        } else {
          blocks.push({
            "id": `b_p_${blockIdx++}`,
            "type": "paragraph",
            "base_content": { "text": trimmed }
          });
        }
      }
    }

    const documentBody = {
      "ud_version": "0.1.0",
      "state": "UDS",
      metadata,
      manifest,
      blocks
    };

    // Calculate canonical key string and SHA-256 hash
    const canonicalJSON = getCanonicalString(documentBody);
    const computedHash = await sha256(canonicalJSON);

    const seal = {
      "sealed_at": isoNow,
      "sealed_by": "The Hive IMR Registry",
      "hash": computedHash,
      "chain_of_custody": [
        {
          "event": "created",
          "actor": "The Hive IMR Registry",
          "timestamp": isoNow,
          "note": "IMR Evaluation Completed and Sovereign Pledge Logged."
        },
        {
          "event": "sealed",
          "actor": "The Hive IMR Registry",
          "timestamp": isoNow,
          "note": "Cryptographic SHA-256 seal computed and anchored to UDS."
        }
      ]
    };

    const completeUDS = {
      ...documentBody,
      "seal": seal
    };

    // Resend configuration
    const resendApiKey = process.env.RESEND_API_KEY || 're_ie4yKiNR_JdWCkjZJ6hrAQZtwcM9Ea3z4';
    const emailFrom = process.env.EMAIL_FROM || 'info@newphysician.org';

    const adminMailHtml = `
      <div style="font-family: monospace; background-color: #0b0b0b; color: #f5f5f5; padding: 30px; border-radius: 12px; border: 1px solid #333;">
        <h2 style="color: #D4AF37; margin-top: 0; font-family: sans-serif; border-bottom: 1px solid #222; padding-bottom: 10px;">
          [MOH Pilot Program] Kintsugi Blueprint Computed
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
            <td style="padding: 8px 0; color: #888;">Capture Score:</td>
            <td style="padding: 8px 0; color: #D4AF37; font-size: 20px; font-weight: bold;">${cleanScore}%</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Calibrated Tier:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #fff;">${tier.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Cryptographic Hash:</td>
            <td style="padding: 8px 0; color: #10B981; font-family: monospace; font-size: 11px;">${computedHash}</td>
          </tr>
        </table>
      </div>
    `;

    const candidateMailHtml = `
      <div style="font-family: sans-serif; background-color: #050505; color: #dddddd; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #1a1a1a; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 12px; background-color: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 50%; margin-bottom: 15px;">
            <span style="color: #D4AF37; font-size: 28px; font-weight: bold;">🛡️</span>
          </div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">
            Sovereignty Evaluation & Blueprint Sealed
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
            Thank you for completing the assessment for the **HiveIMR Global Pilot Program**. We have processed your profile, calibrated your scores, and dynamically compiled your custom **Kintsugi Career Transition Blueprint**.
          </p>
          
          <div style="border-top: 1px solid #1e1e1e; border-bottom: 1px solid #1e1e1e; padding: 20px 0; margin: 20px 0; text-align: center;">
            <p style="color: #888888; font-size: 12px; text-transform: uppercase; margin: 0 0 5px 0; font-family: monospace;">
              Systemic Capture Score
            </p>
            <p style="color: #D4AF37; font-size: 48px; font-weight: bold; margin: 0; font-family: monospace; text-shadow: 0 0 10px rgba(212,175,55,0.2);">
              ${cleanScore}%
            </p>
            <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 5px 0 0 0;">
              Calibrated Status: ${tier.title}
            </p>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #aaaaaa;">
            Your custom transition blueprint has been physically attached to this email as a cryptographically signed **.uds** document format, fully compliant with the interoperable **iSDF v0.1.0** standard.
          </p>
        </div>

        <!-- OUTBOUND LINK TO READER -->
        <div style="background-color: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 22px; text-align: center; margin: 25px 0;">
          <p style="color: #ffffff; font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 8px;">
            🛡️ Interoperable UDS Reader Access
          </p>
          <p style="font-size: 13px; color: #aaaaaa; line-height: 1.6; margin-bottom: 18px; margin-top: 0;">
            Your consultation blueprint is tamper-evident. Download the attached <strong>.uds</strong> file and upload it to the official Hive Baby Universal Document Reader to verify its SHA-256 seal and view parallel clarity layers.
          </p>
          <a href="https://reader.hive.baby" target="_blank" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; box-shadow: 0 4px 15px rgba(212,175,55,0.2);">
            Open in official UD Reader
          </a>
        </div>

        <div style="border-top: 1px solid #1a1a1a; padding-top: 25px; text-align: center; color: #666666; font-size: 12px;">
          <p style="margin: 0;">
            To direct clinical care and the restoration of the oath.
          </p>
          <p style="margin: 5px 0 0 0; color: #888888;">
            <strong>The HiveIMR Pilot Team</strong>
          </p>
          <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 10px; color: #10B981;">
            SHA-256 Seal: ${computedHash}
          </p>
        </div>
      </div>
    `;

    const udsFilename = `kintsugi-blueprint-${lastName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.uds`;

    try {
      const udsBase64 = btoa(JSON.stringify(completeUDS, null, 2));
      
      await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `The New Physician <${emailFrom}>`,
            to: ['hive@hive.baby'],
            subject: `[MOH Pilot Applicant] Blueprint Sealed: Dr. ${lastName} (${cleanScore}%)`,
            html: adminMailHtml
          })
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `The New Physician <${emailFrom}>`,
            to: [email.trim().toLowerCase()],
            subject: `[HiveIMR Global Pilot] Kintsugi Career Transition Blueprint Sealed`,
            html: candidateMailHtml,
            attachments: [
              {
                filename: udsFilename,
                content: udsBase64
              }
            ]
          })
        })
      ]);
      console.log('Successfully dispatched blueprint emails via Resend API.');
    } catch (mailError) {
      console.error('Failed to dispatch blueprint emails:', mailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Kintsugi evaluation and UDS compiled successfully.',
      blueprintText,
      uds: completeUDS,
      registrationId: registration.id
    });
  } catch (error: any) {
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      return NextResponse.json({ success: true, message: 'You have already registered for the Pilot Program' });
    }
    console.error('Sovereignty Evaluation API Error:', error);
    return NextResponse.json({ error: 'Failed to process evaluation blueprint' }, { status: 500 });
  }
}
