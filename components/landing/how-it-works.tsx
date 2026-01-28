'use client'

import { useState } from 'react'
import { UserPlus, Settings, Rocket, HeartHandshake } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Cadastre sua Clinica',
    description: 'Crie sua conta em minutos. Basta informar os dados basicos da sua clinica e escolher o plano ideal para voce. Comece com 14 dias gratis.',
  },
  {
    icon: Settings,
    number: '02',
    title: 'Configure seu Ambiente',
    description: 'Personalize o sistema de acordo com as necessidades da sua clinica. Adicione usuarios, configure permissoes e importe seus dados existentes.',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Comece a Usar',
    description: 'Sua clinica ja esta pronta para operar. Cadastre pacientes, agende consultas, registre atendimentos e acompanhe metricas em tempo real.',
  },
  {
    icon: HeartHandshake,
    number: '04',
    title: 'Conte com Nosso Suporte',
    description: 'Estamos sempre disponiveis para ajudar. Tire duvidas, receba dicas de uso e tenha uma equipe dedicada ao sucesso da sua clinica.',
  },
]

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

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
            Mostramos exatamente o que fazer. E configuramos para voce.
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Tudo em menos de uma semana.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps list */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                  activeStep === index 
                    ? 'glass-card' 
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

          {/* Visual card */}
          <div className="glass-card p-8 rounded-3xl lg:p-12">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              </div>
              <div className="relative z-10 text-center p-8">
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-primary-foreground mx-auto mb-6">
                  {(() => {
                    const StepIcon = steps[activeStep].icon
                    return <StepIcon className="h-10 w-10" />
                  })()}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {steps[activeStep].title}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
