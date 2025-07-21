import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const movements = await prisma.movement.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json({ error: 'Failed to fetch movements' }, { status: 500 });
  }
}
