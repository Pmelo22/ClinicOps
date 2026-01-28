import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidade | ClinicOps',
  description: 'Conheça nossa política de privacidade e como protegemos seus dados.',
}

export default function PrivacidadePage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Política de Privacidade</h1>
          <p className="text-green-100">Última atualização: Janeiro de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-green dark:prose-invert max-w-none">
            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                Na ClinicOps, a privacidade e segurança dos seus dados são nossas prioridades máximas. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma.
              </p>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">2. Informações que Coletamos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Coletamos informações que você fornece diretamente:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Nome, email e dados de contato</li>
                <li>Informações de sua clínica ou estabelecimento</li>
                <li>Dados de pagamento e faturamento</li>
                <li>Informações de pacientes (conforme autorizado)</li>
                <li>Dados de uso e comportamento na plataforma</li>
              </ul>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">3. Como Usamos Seus Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Utilizamos suas informações para:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar transações e enviar faturas</li>
                <li>Comunicar-se sobre atualizações e suporte</li>
                <li>Garantir a segurança e conformidade</li>
                <li>Personalizar sua experiência</li>
              </ul>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">4. Segurança de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas, administrativas e físicas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Todos os dados sensíveis são criptografados em trânsito e em repouso.
              </p>
            </section>

            <section className="mb-12 glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">5. Direitos do Usuário</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Você tem o direito de:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir informações imprecisas</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Exportar seus dados</li>
                <li>Revogar consentimentos</li>
              </ul>
            </section>

            <section className="glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">6. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para questões sobre privacidade, entre em contato conosco através do formulário de contato em nossa página de Empresa.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
