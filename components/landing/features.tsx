import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Shield, 
  Smartphone 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Users,
    title: 'Gestao de Pacientes',
    description: 'Cadastro completo com historico medico, prontuarios e documentos centralizados em um so lugar.',
  },
  {
    icon: Calendar,
    title: 'Agendamento Inteligente',
    description: 'Sistema de agendamento com lembretes automaticos, confirmacao e gestao de horarios.',
  },
  {
    icon: FileText,
    title: 'Prontuario Eletronico',
    description: 'Documentacao clinica digital com assinatura eletronica e rastreabilidade completa.',
  },
  {
    icon: BarChart3,
    title: 'Relatorios e Analytics',
    description: 'Dashboards personalizados com metricas de atendimento, financeiro e operacional.',
  },
  {
    icon: Shield,
    title: 'Seguranca e Compliance',
    description: 'Criptografia de dados, auditoria completa e total conformidade com a LGPD.',
  },
  {
    icon: Smartphone,
    title: 'Acesso Multiplataforma',
    description: 'Acesse de qualquer dispositivo com interface responsiva e sincronizacao em tempo real.',
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Tudo que sua clinica precisa em uma so plataforma
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Recursos completos para otimizar a gestao e melhorar o atendimento aos seus pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
