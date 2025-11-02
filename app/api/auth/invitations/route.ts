import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, role } = await request.json();

    // Check if there's an existing invitation for this email
    const existingInvitation = await prisma.invitation.findUnique({
      where: { email },
    });

    let invitation;

    if (existingInvitation) {
      // Update the existing invitation with a new token and expiry
      invitation = await prisma.invitation.update({
        where: { email },
        data: {
          role,
          token: generateToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          createdBy: session.user.id,
          used: false,
          usedAt: null,
          usedBy: null,
        },
      });
    } else {
      // Create a new invitation
      invitation = await prisma.invitation.create({
        data: {
          email,
          role,
          token: generateToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          createdBy: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invitations = await prisma.invitation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}
