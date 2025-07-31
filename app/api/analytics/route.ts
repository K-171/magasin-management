import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const totalItems = await prisma.item.count();
    const lowStockItems = await prisma.item.count({ where: { quantity: { lt: 10 } } });
    const outOfStockItems = await prisma.item.count({ where: { quantity: { equals: 0 } } });
    const overdueItems = await prisma.movement.count({
      where: {
        expectedReturnDate: { lt: new Date() },
        status: "En Prêt",
      },
    });

    const movements = await prisma.movement.findMany({
      where: { timestamp: { gte: startDate } },
      select: { timestamp: true, type: true, quantity: true },
      orderBy: { timestamp: "asc" },
    });

    const dailyMovements: { date: string; checkIn: number; checkOut: number }[] = [];
    movements.forEach((movement) => {
      const date = movement.timestamp.toISOString().split("T")[0];
      let existingEntry = dailyMovements.find((entry) => entry.date === date);

      if (!existingEntry) {
        existingEntry = { date, checkIn: 0, checkOut: 0 };
        dailyMovements.push(existingEntry);
      }

      if (movement.type === "Entrée") {
        existingEntry.checkIn += movement.quantity;
      } else if (movement.type === "Sortie") {
        existingEntry.checkOut += movement.quantity;
      }
    });

    const mostActiveItems = await prisma.movement.groupBy({
      by: ["itemName"],
      where: { timestamp: { gte: startDate } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const mostActiveUsers = await prisma.movement.groupBy({
      by: ["handledBy"],
      where: { timestamp: { gte: startDate } },
      _count: { movementId: true },
      orderBy: { _count: { movementId: "desc" } },
      take: 5,
    });

    return NextResponse.json({
      totalItems,
      lowStockItems,
      outOfStockItems,
      overdueItems,
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
