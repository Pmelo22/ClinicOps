'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, ArrowRight, TrendingDown } from 'lucide-react'
import { PLANS } from '@/lib/products'
import { useState } from 'react'

type BillingPeriod = 'monthly' | 'quarterly' | 'annual'

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

  const getBillingMultiplier = (period: BillingPeriod) => {
    switch (period) {
      case 'monthly':
        return { multiplier: 1, label: 'Mensal', discount: 0 }
      case 'quarterly':
        return { multiplier: 2.7, label: 'Trimestral', discount: 10 }
      case 'annual':
        return { multiplier: 10, label: 'Anual', discount: 20 }
    }
  }

  const { multiplier, discount } = getBillingMultiplier(billingPeriod)

  return (
    <section id="precos" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-muted/20">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm font-medium mb-8 text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Preços transparentes</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground text-balance">
            Comece com 14 dias grátis
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Sem cartão de crédito necessário. Acesso completo a todos os recursos durante o período de teste.
          </p>
        </div>

        {/* Billing Period Selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 glass rounded-2xl p-1">
            {(['monthly', 'quarterly', 'annual'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all relative ${
                  billingPeriod === period
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {period === 'monthly' && 'Mensal'}
                {period === 'quarterly' && 'Trimestral'}
                {period === 'annual' && 'Anual'}
                
                {period !== 'monthly' && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-accent">
                    <TrendingDown className="h-3 w-3" />
                    {getBillingMultiplier(period).discount}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const basePrice = plan.priceInCents / 100
            const finalPrice = basePrice * multiplier * (1 - discount / 100)
            const totalSavings = (basePrice * multiplier * discount) / 100

            return (
              <div 
                key={plan.id} 
                className={`relative flex flex-col glass-card rounded-3xl overflow-hidden ${
                  plan.highlighted 
                    ? 'ring-2 ring-primary shadow-xl shadow-primary/10 scale-105 z-10' 
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 py-2 bg-primary text-center">
                    <span className="text-sm font-medium text-primary-foreground">Mais Popular</span>
                  </div>
                )}
                <div className={`p-8 ${plan.highlighted ? 'pt-14' : ''}`}>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                  
                  <div className="mt-6 mb-8">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-foreground">
                          R$ {finalPrice.toFixed(0)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {billingPeriod === 'monthly' && 'por mês'}
                        {billingPeriod === 'quarterly' && 'por trimestre'}
                        {billingPeriod === 'annual' && 'por ano'}
                      </div>
                    </div>
                    
                    {billingPeriod !== 'monthly' && totalSavings > 0 && (
                      <div className="text-sm text-accent mt-3 flex items-center gap-1 font-medium">
                        <TrendingDown className="h-4 w-4" />
                        Economize R$ {totalSavings.toFixed(0)}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className={`w-full h-12 rounded-xl ${
                      plan.highlighted 
                        ? 'shadow-lg shadow-primary/25' 
                        : ''
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={`/auth/cadastro?plano=${plan.id}`}>
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <p className="text-center text-sm text-accent mt-3 font-medium">
                    14 dias grátis
                  </p>
                </div>
                
                <div className="p-8 pt-0 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.highlighted ? 'bg-primary/10' : 'bg-accent/10'
                        }`}>
                          <Check className={`h-3 w-3 ${
                            plan.highlighted ? 'text-primary' : 'text-accent'
                          }`} />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 glass-card rounded-3xl p-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Precisa de algo personalizado?
          </h3>
          <p className="text-muted-foreground mb-8 text-lg">
            Para redes de clínicas ou necessidades específicas, entre em contato 
            para um plano sob medida.
          </p>
          <Button variant="outline" asChild className="h-12 px-8 rounded-xl bg-transparent">
            <Link href="https://www.linkedin.com/in/pmelo22" target="_blank">Falar com Vendas</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
