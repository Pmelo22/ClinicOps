import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Lei Geral de Proteção de Dados (LGPD) | ClinicOps',
  description: 'Conformidade com LGPD e proteção de dados pessoais.',
}

export default function LGPDPage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Lei Geral de Proteção de Dados (LGPD)</h1>
          <p className="text-green-100">Conformidade e Direitos dos Titulares de Dados</p>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-green dark:prose-invert max-w-none">
            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">1. Sobre a LGPD</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Lei Geral de Proteção de Dados (LGPD) é a legislação brasileira que regula o tratamento de dados pessoais. A ClinicOps está totalmente comprometida em cumprir com todos os requisitos da LGPD.
              </p>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">2. Princípios de Tratamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Aplicamos os seguintes princípios:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Finalidade:</strong> Dados coletados apenas para fins específicos</li>
                <li><strong>Adequação:</strong> Compatibilidade com contexto de coleta</li>
                <li><strong>Necessidade:</strong> Apenas dados essenciais são coletados</li>
                <li><strong>Transparência:</strong> Informações claras sobre uso de dados</li>
                <li><strong>Segurança:</strong> Proteção contra acessos não autorizados</li>
              </ul>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">3. Direitos do Titular de Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Você tem os seguintes direitos:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Acesso:</strong> Acessar seus dados pessoais a qualquer momento</li>
                <li><strong>Retificação:</strong> Corrigir informações imprecisas</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados</li>
                <li><strong>Portabilidade:</strong> Obter seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Se opor ao tratamento de seus dados</li>
                <li><strong>Consentimento:</strong> Revogar consentimento a qualquer momento</li>
              </ul>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">4. Segurança e Proteção</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">A ClinicOps implementa:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controles de acesso rigorosos</li>
                <li>Auditorias de segurança regulares</li>
                <li>Plano de resposta a incidentes</li>
                <li>Conformidade com padrões internacionais</li>
              </ul>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">5. Consentimento</h2>
              <p className="text-muted-foreground leading-relaxed">
                O tratamento de dados pessoais na ClinicOps é baseado em consentimento expresso. Você pode revogar seu consentimento a qualquer momento através da sua conta ou entrando em contato conosco.
              </p>
            </section>

            <section className="glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">6. Exercer Seus Direitos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer qualquer um de seus direitos LGPD, envie uma solicitação através de nossa página de Contato. Responderemos dentro de 30 dias úteis conforme a lei.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
