import { Check } from 'lucide-react'

const benefits = [
  {
    title: 'Para Administradores',
    items: [
      'Visao completa de todas as operacoes',
      'Controle de usuarios e permissoes',
      'Relatorios financeiros detalhados',
      'Monitoramento de uso do plano',
    ],
  },
  {
    title: 'Para Profissionais de Saude',
    items: [
      'Acesso rapido ao historico do paciente',
      'Registro simplificado de atendimentos',
      'Emissao de receitas e atestados',
      'Agenda integrada e organizada',
    ],
  },
  {
    title: 'Para Recepcionistas',
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
    <section id="beneficios" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Beneficios para toda a equipe
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cada membro da sua equipe tem ferramentas especificas para suas necessidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div 
              key={benefit.title} 
              className="p-8 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-xl font-semibold text-foreground mb-6">
                {benefit.title}
              </h3>
              <ul className="space-y-4">
                {benefit.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-accent" />
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
