import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Clock, Users, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden gradient-bg min-h-screen flex items-center">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl blob" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl blob" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-3xl" />
      
      <div className="relative mx-auto max-w-7xl w-full">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm font-medium mb-8 text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Simplifique a gestão da sua clínica</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight text-balance leading-tight">
            Sem estresse,{' '}
            <span className="text-primary relative">
              só progresso
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-accent"/>
              </svg>
            </span>
          </h1>
          
          <p className="mt-8 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Tenha uma plataforma completa e um sistema sob medida que leva sua clínica aos seus objetivos mais rápido.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Link href="/auth/cadastro">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl bg-transparent glass border-0">
              <Link href="/pricing">Ver Planos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
