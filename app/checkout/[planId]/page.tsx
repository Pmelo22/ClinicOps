"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/products";
import Checkout from "@/components/checkout";
import { Suspense } from "react";

function CheckoutContent({ planId }: { planId: string }) {
  const searchParams = useSearchParams();
  const clinicaId = searchParams.get("clinicaId") || undefined;

  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Plano nao encontrado
          </h1>
          <Link href="/pricing">
            <Button>Ver planos disponiveis</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para planos
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Assinar {plan.name}
            </h1>
            <p className="text-muted-foreground">{plan.description}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              O que esta incluso:
            </h2>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Checkout planId={planId} clinicaId={clinicaId} />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Carregando...
          </div>
        </div>
      }
    >
      <CheckoutContent planId={planId} />
    </Suspense>
  );
}
