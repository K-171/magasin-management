import { NextResponse } from 'next/server';
import { hashPassword, generateSalt, validatePassword, validateEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, username, firstName, lastName, password, invitationToken } = await request.json();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    // Verify invitation token
    if (!invitationToken) {
      return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token: invitationToken },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or revoked invitation token' }, { status: 400 });
    }

    if (invitation.used) {
      return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    if (invitation.email !== email) {
      return NextResponse.json({ error: 'Email does not match invitation' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 409 });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    // Create user with role from invitation
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        passwordHash,
        salt,
        role: invitation.role,
        isEmailVerified: true, // Auto-verify since they used a valid invitation
      },
    });

    // Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        used: true,
        usedAt: new Date(),
        usedBy: user.id,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
