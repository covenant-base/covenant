import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { covenantBrand } from '@covenant/config/brand';
import {
  SESSION_ISSUER,
  sessionSecret,
  verifySessionJwt,
  type SessionPayload,
} from '@covenant/sdk';

function secret(): Uint8Array {
  return sessionSecret(process.env.SESSION_SECRET);
}

export async function signSession(address: `0x${string}`, ttlSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds;
  const token = await new SignJWT({ address })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(SESSION_ISSUER)
    .setSubject(address)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secret());

  return { token, expiresAt: exp };
}

export async function createSession(address: `0x${string}`, ttlSeconds = 24 * 60 * 60) {
  const { token, expiresAt } = await signSession(address, ttlSeconds);
  const jar = await cookies();
  jar.set(covenantBrand.cookies.session, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ttlSeconds,
  });

  return {
    address,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  };
}

export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(covenantBrand.cookies.session)?.value;
  if (!token) return null;
  return verifySessionJwt(token, secret());
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(covenantBrand.cookies.session);
}
