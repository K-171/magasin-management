import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function DELETE() {
  const session = await getSession();

  if (!session || session.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.movement.deleteMany({});
    return NextResponse.json({ message: 'Movement log cleared' });
  } catch (error) {
    console.error('Error clearing movement log:', error);
    return NextResponse.json({ error: 'Failed to clear movement log' }, { status: 500 });
  }
}
