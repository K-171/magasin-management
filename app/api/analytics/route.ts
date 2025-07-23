import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Total Inventory
    const totalItems = await prisma.item.count();

    // Low Stock Items (assuming quantity < 10 for low stock)
    const lowStockItems = await prisma.item.count({
      where: {
        quantity: {
          lt: 10,
        },
      },
    });

    // Out of Stock Items
    const outOfStockItems = await prisma.item.count({
      where: {
        quantity: {
          equals: 0,
        },
      },
    });

    // Movements over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await prisma.movement.findMany({
      where: {
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        timestamp: true,
        type: true,
        quantity: true,
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    const dailyMovements: { date: string; checkIn: number; checkOut: number }[] = [];
    movements.forEach((movement) => {
      const date = movement.timestamp.toISOString().split("T")[0];
      let existingEntry = dailyMovements.find((entry) => entry.date === date);

      if (!existingEntry) {
        existingEntry = { date, checkIn: 0, checkOut: 0 };
        dailyMovements.push(existingEntry);
      }

      if (movement.type === "Check-in") {
        existingEntry.checkIn += movement.quantity;
      } else if (movement.type === "Check-out") {
        existingEntry.checkOut += movement.quantity;
      }
    });

    // Most Active Items (based on movement count)
    const mostActiveItems = await prisma.movement.groupBy({
      by: ["itemName"],
      _count: {
        movementId: true,
      },
      orderBy: {
        _count: {
          movementId: "desc",
        },
      },
      take: 5,
    });

    // Most Active Users (based on movement count)
    const mostActiveUsers = await prisma.movement.groupBy({
      by: ["handledBy"],
      _count: {
        movementId: true,
      },
      orderBy: {
        _count: {
          movementId: "desc",
        },
      },
      take: 5,
    });

    return NextResponse.json({
      totalItems,
      lowStockItems,
      outOfStockItems,
      dailyMovements,
      mostActiveItems,
      mostActiveUsers,
    });
  } catch (error: any) {
    console.error("Failed to fetch analytics data:", error.message, error.stack);
    return NextResponse.json(
      { error: "An unexpected error occurred.", details: error.message },
      { status: 500 }
    );
  }
}
