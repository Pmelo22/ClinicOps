import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Users, Target } from 'lucide-react'

export const metadata = {
  title: 'Sobre Nós | ClinicOps',
  description: 'Conheça a ClinicOps, nossa missão, visão e história.',
}

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="mx-auto max-w-4xl relative">
          <Link href="/">
            <Button variant="secondary" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Sobre a ClinicOps</h1>
          <p className="text-green-100">Transformando a gestão de clínicas no Brasil</p>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Mission, Vision, Values */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/30 mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Missão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Simplificar e automatizar a gestão de clínicas, permitindo que profissionais de saúde foquem no cuidado com os pacientes.
                </p>
              </div>

              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/30 mb-4">
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">✓</div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Visão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ser a plataforma líder de gestão clínica na América Latina, conhecida por excelência, inovação e confiabilidade.
                </p>
              </div>

              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/30 mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Valores</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Transparência, segurança, inovação contínua e compromisso com o sucesso de nossos clientes.
                </p>
              </div>
            </div>
          </section>

          {/* Story */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Nossa História</h2>
            <div className="prose prose-green dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                A ClinicOps nasceu da frustração com sistemas de gestão clínica antiquados e pouco intuitivos. Nosso fundador, um entusiasta de saúde digital, percebeu que a maioria das clínicas no Brasil ainda usava processos manuais ou softwares obsoletos.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Em 2024, começamos a construir uma solução moderna, segura e fácil de usar. Nossa plataforma foi desenvolvida considerando as necessidades reais de clínicas pequenas, médias e redes hospitalares.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hoje, ajudamos centenas de clínicas a gerenciar seus agendamentos, pacientes e documentação de forma segura e eficiente, permitindo que se concentrem no que importa: cuidar dos pacientes.
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Nossos Números</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-muted-foreground">Clínicas ativas</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
                <p className="text-muted-foreground">Pacientes gerenciados</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                <p className="text-muted-foreground">Uptime garantido</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <p className="text-muted-foreground mb-6">Junte-se a centenas de clínicas que confiam na ClinicOps</p>
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/auth/cadastro">Começar Gratuitamente</Link>
            </Button>
          </section>
        </div>
      </div>
    </main>
  )
}
