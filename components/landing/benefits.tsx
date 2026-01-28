import { Check, UserCog, Stethoscope, Phone } from 'lucide-react'

const benefits = [
  {
    title: 'Para Administradores',
    icon: UserCog,
    color: 'primary',
    items: [
      'Visao completa de todas as operacoes',
      'Controle de usuarios e permissoes',
      'Relatorios financeiros detalhados',
      'Monitoramento de uso do plano',
    ],
  },
  {
    title: 'Para Profissionais de Saude',
    icon: Stethoscope,
    color: 'accent',
    items: [
      'Acesso rapido ao historico do paciente',
      'Registro simplificado de atendimentos',
      'Emissao de receitas e atestados',
      'Agenda integrada e organizada',
    ],
  },
  {
    title: 'Para Recepcionistas',
    icon: Phone,
    color: 'primary',
    items: [
      'Agendamento facil e intuitivo',
      'Cadastro rapido de pacientes',
      'Confirmacao automatica de consultas',
      'Gestao de fila de espera',
    ],
  },
]

export function Benefits() {
  return (
    <section id="beneficios" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Beneficios
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Beneficios para toda a equipe
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Cada membro da sua equipe tem ferramentas especificas para suas necessidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div 
              key={benefit.title} 
              className="glass-card p-8 rounded-3xl"
            >
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${
                benefit.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
              }`}>
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-6">
                {benefit.title}
              </h3>
              <ul className="space-y-4">
                {benefit.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      benefit.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      <Check className={`h-3 w-3 ${
                        benefit.color === 'primary' ? 'text-primary' : 'text-accent'
                      }`} />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
