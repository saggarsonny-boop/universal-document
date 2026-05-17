import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10",
    });

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let checkoutMode: "payment" | "subscription" = "payment";

    if (action === "pay_per_contract") {
      // User provided: https://buy.stripe.com/9B6aEZ7Qzd3rcw2bDz0RG02 $5
      const priceId = process.env.STRIPE_PRICE_PAY_PER_CONTRACT || "price_dummy_base"; 
      lineItems = [{ price: priceId, quantity: 1 }];
      checkoutMode = "payment";
    } else if (action === "enterprise_license") {
      // User provided: STRIPE_PRICE_MONTHLY: price_1TLV4NPIZtoQZOG1m9Uhp848
      const priceId = process.env.STRIPE_PRICE_MONTHLY || "price_1TLV4NPIZtoQZOG1m9Uhp848";
      lineItems = [{ price: priceId, quantity: 1 }];
      checkoutMode = "subscription";
    } else {
      return NextResponse.json({ error: "Invalid billing action" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "us_bank_account"],
      line_items: lineItems,
      mode: checkoutMode,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://legal.hive.baby"}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://legal.hive.baby"}/`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("HiveLegal Billing API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
