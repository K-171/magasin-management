import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const movements = await prisma.movement.findMany({
      where: {
        type: 'Sortie',
        item: {
          category: 'Outillage',
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const calendarEvents = movements.map(movement => ({
      title: `${movement.itemName} - ${movement.handledBy}`,
      start: movement.timestamp,
      end: movement.actualReturnDate || movement.expectedReturnDate,
      allDay: false,
      extendedProps: {
        status: movement.status,
      }
    }));

    return NextResponse.json(calendarEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
