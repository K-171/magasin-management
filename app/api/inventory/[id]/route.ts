import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, category, quantity } = await request.json();

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        category,
        quantity,
        status: getStatus(quantity, category),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Error updating item ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.item.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Error deleting item ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
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
