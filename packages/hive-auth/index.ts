import * as jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';

const JWT_SECRET = process.env.HIVE_JWT_SECRET || 'fallback_queenbee_secret_for_local_dev';

export interface HiveSession {
  userId: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  engines: string[]; // specific engines they have access to
}

export function createSessionToken(session: HiveSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): HiveSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as HiveSession;
  } catch (e) {
    return null;
  }
}

export function parseSessionCookie(cookieHeader: string | null): HiveSession | null {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  const token = cookies['hive_session'];
  if (!token) return null;
  return verifySessionToken(token);
}

export function serializeSessionCookie(token: string): string {
  return serialize('hive_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}
