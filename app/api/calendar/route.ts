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

    const calendarEvents = movements.map(movement => {
      const now = new Date();
      let status = movement.status;

      if (status === 'En Prêt' && movement.expectedReturnDate && new Date(movement.expectedReturnDate) < now) {
        status = 'En Retard';
      }

      let backgroundColor = '#3788d8'; // Default blue for 'En Prêt'
      if (status === 'Retourné') {
        backgroundColor = '#34d399'; // Green
      } else if (status === 'En Retard') {
        backgroundColor = '#ef4444'; // Red
      }

      return {
        title: `${movement.itemName} - ${movement.handledBy}`,
        start: movement.timestamp,
        end: movement.actualReturnDate || movement.expectedReturnDate,
        allDay: false,
        backgroundColor,
        borderColor: backgroundColor,
        extendedProps: {
          status: status,
        }
      }
    });

    return NextResponse.json(calendarEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
