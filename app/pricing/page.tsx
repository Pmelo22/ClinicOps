import Link from 'next/link'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, ArrowRight } from 'lucide-react'
import { PLANS } from '@/lib/products'

export const metadata = {
  title: 'Precos - ClinicOps',
  description: 'Escolha o plano ideal para sua clinica. Teste gratuitamente por 14 dias.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <main className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm font-medium mb-8 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Precos transparentes</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground text-balance">
              Seu primeiro mes por R$10, sem risco.
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Comecar e facil e acessivel. Se o ClinicOps nao for ideal nos primeiros 30 dias, receba reembolso total.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
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
                    <span className="text-5xl font-bold text-foreground">
                      R$ {(plan.priceInCents / 100).toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">/mes</span>
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
                      Comecar por R$10
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    30 dias sem risco
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
            ))}
          </div>

          <div className="mt-24 glass-card rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Todos os planos incluem
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                '14 dias gratis',
                'Suporte dedicado',
                'Atualizacoes gratuitas',
                'Conformidade LGPD',
                'Backup automatico',
                'SSL incluido',
                'Sem fidelidade',
                'Cancele quando quiser',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 glass-card rounded-3xl p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Precisa de algo personalizado?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Para redes de clinicas ou necessidades especificas, entre em contato 
              para um plano sob medida.
            </p>
            <Button variant="outline" asChild className="h-12 px-8 rounded-xl bg-transparent">
              <Link href="#">Falar com Vendas</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
