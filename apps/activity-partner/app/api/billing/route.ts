import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { action, quantity } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10",
    });

    // Live Stripe integration using environment variables for Price IDs
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (action === "subscribe_base") {
      const priceId = process.env.STRIPE_PRICE_BASE_PLATFORM || "price_dummy_base";
      lineItems = [{ price: priceId, quantity: 1 }];
    } else if (action === "add_seats") {
      const priceId = process.env.STRIPE_PRICE_SEAT_LICENSE || "price_dummy_seat";
      lineItems = [{ price: priceId, quantity: quantity || 1 }];
    } else if (action === "upgrade_voice") {
      const priceId = process.env.STRIPE_PRICE_VOICE_MODULE || "price_dummy_voice";
      lineItems = [{ price: priceId, quantity: 1 }];
    } else if (action === "upgrade_imagery") {
      const priceId = process.env.STRIPE_PRICE_IMAGERY_MODULE || "price_dummy_imagery";
      lineItems = [{ price: priceId, quantity: 1 }];
    } else {
      return NextResponse.json({ error: "Invalid billing action" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://activitypartner.hive.baby"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://activitypartner.hive.baby"}/enterprise`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("AAC Billing API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
