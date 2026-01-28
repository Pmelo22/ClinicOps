'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Settings, Rocket, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Cadastre sua Clínica',
    description: 'Crie sua conta em minutos. Basta informar os dados básicos da sua clínica e escolher o plano ideal para você. Comece com 14 dias grátis.',
  },
  {
    icon: Settings,
    number: '02',
    title: 'Configure seu Ambiente',
    description: 'Personalize o sistema de acordo com as necessidades da sua clínica. Adicione usuários, configure permissões e importe seus dados existentes.',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Comece a Usar',
    description: 'Sua clínica já está pronta para operar. Cadastre pacientes, agende consultas, registre atendimentos e acompanhe métricas em tempo real.',
  },
  {
    icon: HeartHandshake,
    number: '04',
    title: 'Conte com Nosso Suporte',
    description: 'Estamos sempre disponíveis para ajudar. Tire dúvidas, receba dicas de uso e tenha uma equipe dedicada ao sucesso da sua clínica.',
  },
]

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlay) return

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 5000) // 5 segundos

    return () => clearInterval(timer)
  }, [isAutoPlay])

  const goToStep = (index: number) => {
    setActiveStep(index)
    setIsAutoPlay(false)
    // Retomar autoplay depois de 1 segundo
    setTimeout(() => setIsAutoPlay(true), 1000)
  }

  const previousStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 1000)
  }

  const nextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 1000)
  }

  return (
    <section id="como-funciona" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-muted/20">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Como Funciona
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Mostramos exatamente o que fazer. E configuramos para você.
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Tudo em menos de uma semana.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps list - Desktop */}
          <div className="space-y-4 hidden lg:block">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => goToStep(index)}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                  activeStep === index 
                    ? 'glass-card ring-2 ring-primary/50' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                    activeStep === index 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-medium ${
                        activeStep === index ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        Passo {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    {activeStep === index && (
                      <p className="text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Visual card with video */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <video
              src="/example.mp4"
              controls
              className="w-full h-auto rounded-3xl"
              autoPlay
              loop
              muted
              style={{ maxHeight: '600px' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
