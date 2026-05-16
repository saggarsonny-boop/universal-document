import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Verify state
  // const cookieStore = cookies();
  // const savedState = cookieStore.get('epic_oauth_state')?.value;
  // if (state !== savedState) {
  //   return new NextResponse('Invalid State Parameter', { status: 400 });
  // }

  if (!code) {
    return new NextResponse('Missing Authorization Code', { status: 400 });
  }

  const clientId = process.env.EPIC_CLIENT_ID || '';
  const clientSecret = process.env.EPIC_CLIENT_SECRET || '';
  const redirectUri = 'https://hemodynamics.hive.baby/api/auth/callback/epic';
  const tokenUrl = process.env.EPIC_TOKEN_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token';

  try {
    // Exchange code for token
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }).toString()
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Epic Token Error:', tokenData);
      return new NextResponse('Failed to get token: ' + JSON.stringify(tokenData), { status: 400 });
    }

    // Successfully got token! 
    // const accessToken = tokenData.access_token;
    // const patientId = tokenData.patient;

    // Phase 1: Redirect back to the dashboard with a success parameter to trigger the mock UI
    // In Phase 2, we would securely store the accessToken in a HttpOnly cookie and fetch real data
    
    const response = NextResponse.redirect(new URL('/?epic_sync=success', request.url));
    
    // Securely store the token for future API calls
    response.cookies.set('epic_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 3600,
    });
    
    if (tokenData.patient) {
      response.cookies.set('epic_patient_id', tokenData.patient, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: tokenData.expires_in || 3600,
      });
    }

    return response;

  } catch (error: any) {
    console.error("Callback Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
