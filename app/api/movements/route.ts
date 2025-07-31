import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const movements = await prisma.movement.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });

    const updatedMovements = movements.map(movement => {
      if (movement.expectedReturnDate && new Date(movement.expectedReturnDate) < new Date() && movement.status !== 'Retourné') {
        return { ...movement, status: 'En Retard' };
      }
      return movement;
    });

    return NextResponse.json(updatedMovements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json({ error: 'Failed to fetch movements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { itemId, itemName, type, quantity, handledBy, expectedReturnDate: rawExpectedReturnDate, status } = await request.json();

    const expectedReturnDate = rawExpectedReturnDate ? new Date(rawExpectedReturnDate) : null;

    // Use a transaction to ensure both movement creation and item update are successful
    const [newMovement] = await prisma.$transaction([
      prisma.movement.create({
        data: {
          itemId,
          itemName,
          type,
          quantity,
          handledBy,
          expectedReturnDate,
          status,
        },
      }),
      prisma.item.update({
        where: { id: itemId },
        data: {
          quantity: {
            // Decrement for 'Sortie' (Check-out), increment for 'Entrée' (Check-in)
            [type === 'Sortie' ? 'decrement' : 'increment']: quantity,
          },
        },
      }),
    ]);

    return NextResponse.json(newMovement, { status: 201 });
  } catch (error) {
    console.error('Error creating movement:', error);
    return NextResponse.json({ error: 'Failed to create movement' }, { status: 500 });
  }
}
