import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: {
        dateAdded: 'desc',
      },
    });

    const updatedItems = items.map(item => {
      if (item.expectedReturnDate && new Date(item.expectedReturnDate) < new Date()) {
        return { ...item, status: 'Overdue' };
      }
      return item;
    });

    return NextResponse.json(updatedItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, quantity } = await request.json();
    const newItem = await prisma.item.create({
      data: {
        name,
        category,
        quantity,
        status: getStatus(quantity, category),
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

function getStatus(quantity: number, category: string): string {
  if (quantity === 0) {
    return "Out of Stock";
  }
  if (category === "Outillage") {
    return "In Stock";
  }
  if (category === "Pièce consomable") {
    if (quantity <= 10) {
      return "Low Stock";
    }
  }
  return "In Stock";
}
