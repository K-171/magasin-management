import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const movementId = params.id;
    const now = new Date();

    const updatedMovement = await prisma.movement.update({
      where: { movementId },
      data: {
        status: 'Retourné',
        actualReturnDate: now,
      },
    });

    return NextResponse.json(updatedMovement);
  } catch (error) {
    console.error('Error checking in item:', error);
    return NextResponse.json({ error: 'Failed to check in item' }, { status: 500 });
  }
}