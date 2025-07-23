import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const movement = await prisma.movement.findUnique({
      where: { movementId: params.id },
    });

    if (!movement) {
      return NextResponse.json({ error: 'Movement not found' }, { status: 404 });
    }

    const updatedMovement = await prisma.movement.update({
      where: { movementId: params.id },
      data: { status: 'Retourné' },
    });

    // Update the item quantity
    await prisma.item.update({
      where: { id: movement.itemId },
      data: {
        quantity: {
          increment: movement.quantity,
        },
      },
    });

    return NextResponse.json(updatedMovement);
  } catch (error) {
    console.error(`Error checking in item for movement ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to check in item' }, { status: 500 });
  }
}
