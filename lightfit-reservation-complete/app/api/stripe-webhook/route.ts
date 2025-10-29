
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new NextResponse("Bad config", { status: 500 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e: any) {
    return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const email =
          (s.metadata?.email as string | undefined) ||
          s.customer_details?.email ||
          (s.customer_email as string | null) ||
          undefined;
        const planCode = (s.metadata?.planCode as string | undefined) || undefined;
        const priceId = (s.metadata?.priceId as string | undefined) || undefined;

        const stripeCustomerId =
          (typeof s.customer === "string" ? s.customer : s.customer?.id) || undefined;
        const stripeSubscriptionId =
          (typeof s.subscription === "string" ? s.subscription : s.subscription?.id) || undefined;

        if (!email || !planCode) break;

        const user =
          (await prisma.user.findUnique({ where: { email } })) ??
          (await prisma.user.create({ data: { email, role: "MEMBER" } }));

        const sessionLengthMinutes = planCode.includes("25m") ? 25 : 55;
        const match = planCode.match(/x(\d+)/);
        const monthlySessions = match ? Number(match[1]) : 4;
        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);

        await prisma.membership.create({
          data: {
            userId: user.id,
            planCode,
            priceId,
            stripeCustomerId,
            stripeSubscriptionId,
            status: "ACTIVE",
            sessionLengthMinutes,
            monthlySessions,
            remainingSessions: monthlySessions,
            cycleAnchor: now,
            currentPeriodStart: now,
            currentPeriodEnd: end,
          },
        });
        break;
      }

      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId =
          (typeof inv.customer === "string" ? inv.customer : inv.customer?.id) || undefined;
        const subId =
          (typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id) || undefined;

        if (!customerId) break;

        const m = await prisma.membership.findFirst({
          where: { stripeCustomerId: customerId },
          orderBy: { createdAt: "desc" },
        });
        if (m) {
          await prisma.membership.update({
            where: { id: m.id },
            data: {
              status: "ACTIVE",
              remainingSessions: m.monthlySessions,
              stripeSubscriptionId: subId ?? m.stripeSubscriptionId ?? undefined,
              currentPeriodStart: new Date(inv.period_start * 1000),
              currentPeriodEnd: new Date(inv.period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.membership.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELED" },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const map: Record<string, string> = {
          active: "ACTIVE",
          past_due: "ACTIVE",
          unpaid: "ACTIVE",
          paused: "PAUSED",
          canceled: "CANCELED",
          incomplete: "ACTIVE",
          incomplete_expired: "CANCELED",
          trialing: "ACTIVE",
        };
        await prisma.membership.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: map[sub.status] ?? "ACTIVE" },
        });
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new NextResponse("Handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
