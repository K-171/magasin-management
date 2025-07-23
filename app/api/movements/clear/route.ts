import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function DELETE() {
  const session = await getSession();
  console.log('User role:', session.role);

  if (!session || session.role !== 'admin') {
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
