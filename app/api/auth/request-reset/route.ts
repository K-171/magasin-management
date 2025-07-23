import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
