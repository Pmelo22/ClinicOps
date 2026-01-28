import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background with glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      
      <div className="relative mx-auto max-w-4xl">
        <div className="glass rounded-3xl p-12 md:p-16 text-center border-white/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Comece hoje mesmo</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-white text-balance">
            Pronto para transformar a gestao da sua clinica?
          </h2>
          <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto">
            Comece agora com 14 dias de teste gratuito. Sem necessidade de cartao de credito.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl bg-white text-primary hover:bg-white/90 shadow-lg">
              <Link href="/auth/cadastro">
                Comecar Teste Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/pricing">Ver Planos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
