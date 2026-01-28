"use server";

import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";

export async function startCheckoutSession(planId: string, clinicaId?: string) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    throw new Error(`Plano com id "${planId}" nao encontrado`);
  }

  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.priceInCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      planId: plan.id,
      clinicaId: clinicaId || "",
    },
  });

  return session.client_secret;
}

export async function createPortalSession(customerId: string) {
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard/admin/configuracoes`,
  });

  return session.url;
}

export async function getSubscriptionStatus(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch {
    return null;
  }
}
