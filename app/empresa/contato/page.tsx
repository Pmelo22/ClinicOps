import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Contato | ClinicOps',
  description: 'Entre em contato conosco. Estamos aqui para ajudar.',
}

export default function ContatoPage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Entre em Contato</h1>
          <p className="text-green-100">Estamos aqui para responder suas perguntas e ajudar com suas necessidades</p>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Formulário de Contato</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Assunto</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Suporte</option>
                    <option>Informações sobre Planos</option>
                    <option>Integração</option>
                    <option>Feedback</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mensagem</label>
                  <textarea
                    rows={5}
                    placeholder="Sua mensagem..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
                <Button className="w-full rounded-xl">Enviar Mensagem</Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Informações de Contato</h2>
              <div className="space-y-6">
                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 flex-shrink-0">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <p className="text-muted-foreground">
                        <a href="mailto:contato@clinicops.com" className="hover:text-green-600 transition-colors">
                          contato@clinicops.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 flex-shrink-0">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Telefone</h3>
                      <p className="text-muted-foreground">
                        <a href="tel:+5511999999999" className="hover:text-green-600 transition-colors">
                          +55 (11) 99999-9999
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Endereço</h3>
                      <p className="text-muted-foreground">
                        São Paulo, SP - Brasil
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <h3 className="font-semibold text-foreground mb-3">Redes Sociais</h3>
                  <p className="text-muted-foreground mb-4">Siga-nos para novidades e atualizações</p>
                  <a
                    href="https://www.linkedin.com/in/pmelo22"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.292-1.39-2.292-1.391 0-1.609 1.086-1.609 2.209v4.26H8.004V9.339h2.52v1.104h.036c.351-.665 1.209-1.39 2.487-1.39 2.658 0 3.15 1.75 3.15 4.025v4.26zM4.004 8.575a1.546 1.546 0 11-.002-3.094 1.546 1.546 0 01.002 3.094zm1.346 7.763H2.658V9.339h2.692v7zm10.273-13.346H2.66a2.25 2.25 0 00-2.25 2.25v11.85a2.25 2.25 0 002.25 2.25h11.277a2.25 2.25 0 002.25-2.25V2.481a2.25 2.25 0 00-2.25-2.25z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Perguntas Frequentes</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Qual é o tempo de resposta do suporte?',
                  a: 'Respondemos todas as mensagens dentro de 24 horas úteis.',
                },
                {
                  q: 'Vocês oferecem suporte por telefone?',
                  a: 'Sim, clientes Premium têm acesso a suporte por telefone 24/7.',
                },
                {
                  q: 'Como faço para solicitar um recurso?',
                  a: 'Você pode enviar solicitações de recursos através do formulário de contato. Valorizamos o feedback de nossos usuários!',
                },
              ].map((faq, idx) => (
                <div key={idx} className="glass-card rounded-3xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
