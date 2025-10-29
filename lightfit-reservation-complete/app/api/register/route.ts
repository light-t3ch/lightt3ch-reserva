
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "missing" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "exists" }, { status: 400 });
  const passwordHash = await hash(password, 10);
  await prisma.user.create({ data: { email, password: passwordHash, role: "MEMBER" } });
  return NextResponse.json({ ok: true });
}
