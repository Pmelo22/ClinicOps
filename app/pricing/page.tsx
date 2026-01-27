import Link from 'next/link'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { PRODUCTS } from '@/lib/products'

export const metadata = {
  title: 'Precos - ClinicOps',
  description: 'Escolha o plano ideal para sua clinica. Teste gratuitamente por 14 dias.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
              Planos simples e transparentes
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Escolha o plano ideal para o tamanho da sua clinica. 
              Todos os planos incluem 14 dias de teste gratuito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRODUCTS.map((product) => (
              <Card 
                key={product.id} 
                className={`relative flex flex-col ${
                  product.highlighted 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border'
                }`}
              >
                {product.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Mais Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-foreground">{product.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-8">
                    <span className="text-4xl font-bold text-foreground">
                      R$ {(product.priceInCents / 100).toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <ul className="space-y-3">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-accent" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={product.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={`/auth/cadastro?plano=${product.id}`}>
                      Comecar Teste Gratuito
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Todos os planos incluem
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                '14 dias gratis',
                'Suporte tecnico',
                'Atualizacoes gratuitas',
                'Conformidade LGPD',
                'Backup automatico',
                'SSL incluido',
                'Sem fidelidade',
                'Cancele quando quiser',
              ].map((item) => (
                <div key={item} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 p-8 rounded-2xl bg-muted/50 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Precisa de algo personalizado?
            </h2>
            <p className="text-muted-foreground mb-6">
              Para redes de clinicas ou necessidades especificas, entre em contato 
              para um plano sob medida.
            </p>
            <Button variant="outline" asChild>
              <Link href="#">Falar com Vendas</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
