import { NextResponse } from 'next/server';
import { hashPassword, generateSalt, validatePassword, validateEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, username, firstName, lastName, password } = await request.json();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 409 });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        passwordHash,
        salt,
        role: 'user', // Default role
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
