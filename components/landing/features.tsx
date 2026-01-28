import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Shield, 
  Smartphone 
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Gestão de Pacientes',
    description: 'Cadastro completo com histórico médico, prontuários e documentos centralizados em um só lugar.',
    color: 'primary',
  },
  {
    icon: Calendar,
    title: 'Agendamento Inteligente',
    description: 'Sistema de agendamento com lembretes automáticos, confirmação e gestão de horários.',
    color: 'accent',
  },
  {
    icon: FileText,
    title: 'Prontuário Eletrônico',
    description: 'Documentação clínica digital com assinatura eletrônica e rastreabilidade completa.',
    color: 'primary',
  },
  {
    icon: BarChart3,
    title: 'Relatórios e Analytics',
    description: 'Dashboards personalizados com métricas de atendimento, financeiro e operacional.',
    color: 'accent',
  },
  {
    icon: Shield,
    title: 'Segurança e Compliance',
    description: 'Criptografia de dados, auditoria completa e total conformidade com a LGPD.',
    color: 'primary',
  },
  {
    icon: Smartphone,
    title: 'Acesso Multiplataforma',
    description: 'Acesse de qualquer dispositivo com interface responsiva e sincronização em tempo real.',
    color: 'accent',
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Recursos
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Tudo que sua clínica precisa em uma só plataforma
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Recursos completos para otimizar a gestão e melhorar o atendimento aos seus pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="glass-card p-8 rounded-3xl"
            >
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${
                feature.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
              }`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
