
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || undefined;
  const userId = searchParams.get("userId") || undefined;

  if (!email && !userId) {
    return NextResponse.json({ error: "email or userId is required" }, { status: 400 });
  }

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findUnique({ where: { id: userId! } });

  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!membership) {
    return NextResponse.json({
      user: { id: user.id, email: user.email },
      membership: null,
      remainingSessions: 0,
      monthlySessions: 0,
    });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    membership: {
      id: membership.id,
      planCode: membership.planCode,
      status: membership.status,
      currentPeriodStart: membership.currentPeriodStart,
      currentPeriodEnd: membership.currentPeriodEnd,
    },
    remainingSessions: membership.remainingSessions,
    monthlySessions: membership.monthlySessions,
  });
}
