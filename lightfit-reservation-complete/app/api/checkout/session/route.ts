
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  const { priceId, planCode, email } = await req.json();
  if (!priceId || !planCode || !email) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const origin = process.env.APP_BASE_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/plans`,
    metadata: { planCode, priceId, email },
  });

  return NextResponse.json({ url: session.url });
}
