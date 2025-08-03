import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma';

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
    return null
  }
}

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, expiresAt });

  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookie = cookies().get('session')?.value
  const sessionData = await decrypt(cookie)

  if (!sessionData || !sessionData.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionData.userId as string },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      lastLoginAt: true,
    }
  });

  if (!user) {
    return null;
  }

  return { user };
}

export async function deleteSession() {
  cookies().delete('session')
}
