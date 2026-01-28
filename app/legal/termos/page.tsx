import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Termos de Uso | ClinicOps',
  description: 'Leia nossos termos de uso para entender seus direitos e responsabilidades.',
}

export default function TermosPage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Termos de Uso</h1>
          <p className="text-green-100">Última atualização: Janeiro de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-green dark:prose-invert max-w-none">
            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar a plataforma ClinicOps, você concorda em estar vinculado por estes Termos de Uso. Se você não concorda com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                ClinicOps é uma plataforma de gestão de clínicas que oferece ferramentas para agendamento, gestão de pacientes, documentação e relatórios. O serviço é fornecido "como está" e pode ser modificado conforme necessário.
              </p>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">3. Responsabilidades do Usuário</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Você concorda em:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Usar a plataforma apenas para fins legítimos</li>
                <li>Manter a confidencialidade de suas credenciais</li>
                <li>Não compartilhar sua conta com terceiros</li>
                <li>Cumprir todas as leis e regulamentações aplicáveis</li>
                <li>Respeitar os direitos de outros usuários</li>
              </ul>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">4. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                A ClinicOps não será responsável por danos indiretos, incidentais, especiais ou consequentes decorrentes do uso de nossa plataforma, incluindo perda de dados ou interrupção de negócios.
              </p>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">5. Pagamento e Cancelamento</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Os planos são cobrados mensalmente, trimestralmente ou anualmente, conforme escolhido. Você pode cancelar sua assinatura a qualquer momento. O cancelamento entra em vigor no final do período de faturamento atual.
              </p>
            </section>

            <section className="glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">6. Modificação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamos o direito de modificar estes termos a qualquer momento. As mudanças significativas serão comunicadas com antecedência.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
