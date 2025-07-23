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

export async function POST(request: Request) {
  try {
    const { itemId, itemName, type, quantity, handledBy, expectedReturnDate, status } = await request.json();

    const newMovement = await prisma.movement.create({
      data: {
        itemId,
        itemName,
        type,
        quantity,
        handledBy,
        expectedReturnDate,
        status,
      },
    });
    return NextResponse.json(newMovement, { status: 201 });
  } catch (error) {
    console.error('Error creating movement:', error);
    return NextResponse.json({ error: 'Failed to create movement' }, { status: 500 });
  }
}
