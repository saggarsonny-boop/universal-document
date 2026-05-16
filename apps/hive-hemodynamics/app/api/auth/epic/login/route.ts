import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  // Generate a random state parameter for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  
  // Scopes based on what the user registered
  const scopes = [
    'launch',
    'openid',
    'profile',
    'fhirUser',
    'Observation.read',
    'DocumentReference.read',
    'Patient.read'
  ].join(' ');

  const clientId = process.env.EPIC_CLIENT_ID;
  const redirectUri = 'https://hemodynamics.hive.baby/api/auth/callback/epic';
  
  // Epic Sandbox Authorize URL
  const authUrl = new URL(process.env.EPIC_AUTH_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize');
  
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId || '');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('state', state);

  // In a real production app, we would set the state in a secure HttpOnly cookie here
  // to verify it when Epic redirects back to the callback.
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('epic_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
