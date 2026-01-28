import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { planId, clinicaId } = session.metadata || {};

        if (clinicaId && session.subscription) {
          await supabase
            .from("clinicas")
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: "ativa",
            })
            .eq("id", clinicaId);

          // Log audit
          await supabase.from("auditoria").insert({
            clinica_id: clinicaId,
            acao: "CREATE",
            entidade: "assinatura",
            entidade_id: session.subscription as string,
            detalhes: {
              plano: planId,
              valor: session.amount_total,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: clinica } = await supabase
          .from("clinicas")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (clinica) {
          const status =
            subscription.status === "active"
              ? "ativa"
              : subscription.status === "past_due"
                ? "inadimplente"
                : "suspensa";

          await supabase
            .from("clinicas")
            .update({ status })
            .eq("id", clinica.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: clinica } = await supabase
          .from("clinicas")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (clinica) {
          await supabase
            .from("clinicas")
            .update({
              status: "suspensa",
              stripe_subscription_id: null,
            })
            .eq("id", clinica.id);

          // Log audit
          await supabase.from("auditoria").insert({
            clinica_id: clinica.id,
            acao: "DELETE",
            entidade: "assinatura",
            entidade_id: subscription.id,
            detalhes: {
              motivo: "cancelamento",
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        const { data: clinica } = await supabase
          .from("clinicas")
          .select("id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (clinica) {
          await supabase
            .from("clinicas")
            .update({ status: "inadimplente" })
            .eq("id", clinica.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
