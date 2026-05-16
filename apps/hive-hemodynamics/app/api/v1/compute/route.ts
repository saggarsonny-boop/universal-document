import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer sk_live_") && !authHeader.startsWith("Bearer sk_test_")) {
      return NextResponse.json({ error: "Unauthorized. Valid Stripe API Key or Hive API Key required." }, { status: 401 });
    }

    const body = await request.json();
    const { sPAP, dPAP, rap } = body;

    if (sPAP === undefined || dPAP === undefined || rap === undefined) {
      return NextResponse.json({ error: "Missing required physiological parameters: sPAP, dPAP, rap." }, { status: 400 });
    }

    if (Number(rap) === 0) {
      return NextResponse.json({ error: "Right Atrial Pressure cannot be zero (division by zero)." }, { status: 400 });
    }

    const papiValue = (Number(sPAP) - Number(dPAP)) / Number(rap);
    
    let risk = "Low / Normal";
    let advice = [
      "PAPi > 2.0 suggests normal right ventricular function.",
      "Continue standard cardioprotective protocols.",
    ];

    if (papiValue < 1.0) {
      risk = "High Risk - Severe RV Dysfunction";
      advice = [
        "PAPi < 1.0 is highly specific for Right Ventricular (RV) Failure.",
        "Consider immediate RV mechanical circulatory support.",
        "Avoid aggressive diuresis which may further reduce RV preload.",
        "Evaluate need for tailored inotropes (e.g., Milrinone) or pulmonary vasodilators.",
      ];
    } else if (papiValue < 1.85) {
      risk = "Moderate Risk - RV Strain";
      advice = [
        "PAPi between 1.0 and 1.85 suggests impending RV strain or dysfunction.",
        "Monitor hemodynamics closely.",
        "Optimize volume status cautiously.",
      ];
    }

    const reportPayload = {
      computation: {
        formula: "PAPi = (sPAP - dPAP) / RAP",
        inputs: { sPAP, dPAP, rap },
        output: Number(papiValue.toFixed(2)),
      },
      analysis: {
        riskCategory: risk,
        cardioprotectiveStrategies: advice,
      },
      provenance: {
        timestamp: new Date().toISOString(),
        engine: "Hive Hemodynamics v1.0",
        signatureReady: true,
      }
    };

    return NextResponse.json(reportPayload);

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error during PAPi computation." }, { status: 500 });
  }
}
