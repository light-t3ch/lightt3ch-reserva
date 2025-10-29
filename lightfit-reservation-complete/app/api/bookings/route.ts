
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isLateCancel } from "@/lib/time";

export async function POST(req: NextRequest) {
  const { userId, membershipId, startAt, endAt } = await req.json();
  if (!userId || !membershipId || !startAt || !endAt) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const m = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!m || m.userId !== userId) {
    return NextResponse.json({ error: "invalid membership" }, { status: 400 });
  }
  if (m.remainingSessions <= 0) {
    return NextResponse.json({ error: "no remaining sessions" }, { status: 400 });
  }

  const booking = await prisma.$transaction(async (tx) => {
    const current = await tx.membership.findUnique({ where: { id: membershipId } });
    if (!current || current.remainingSessions <= 0) {
      throw new Error("no remaining sessions");
    }

    const b = await tx.booking.create({
      data: {
        userId,
        membershipId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        status: "CONFIRMED"
      },
    });

    await tx.membership.update({
      where: { id: membershipId },
      data: { remainingSessions: current.remainingSessions - 1 },
    });

    return b;
  });

  return NextResponse.json(booking);
}

export async function DELETE(req: NextRequest) {
  const { bookingId } = await req.json();
  if (!bookingId) return NextResponse.json({ error: "missing bookingId" }, { status: 400 });

  const bk = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!bk) return NextResponse.json({ ok: true });

  const m = bk.membershipId
    ? await prisma.membership.findUnique({ where: { id: bk.membershipId } })
    : null;

  const late = isLateCancel(new Date(), bk.startAt);

  await prisma.booking.delete({ where: { id: bookingId } });

  if (m && !late) {
    await prisma.membership.update({
      where: { id: m.id },
      data: { remainingSessions: m.remainingSessions + 1 },
    });
  }

  return NextResponse.json({ ok: true, lateCancel: late });
}
