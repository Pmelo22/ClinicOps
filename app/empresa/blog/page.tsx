import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Blog | ClinicOps',
  description: 'Leia artigos, dicas e insights sobre gestão clínica.',
}

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: '5 Estratégias para Reduzir Falta de Pacientes',
      excerpt: 'Descubra técnicas comprovadas para aumentar a taxa de presença de pacientes em suas consultas.',
      date: '15 de Janeiro, 2026',
      category: 'Gestão',
    },
    {
      id: 2,
      title: 'LGPD na Clínica: Guia Completo de Conformidade',
      excerpt: 'Tudo o que você precisa saber sobre proteção de dados e conformidade com a LGPD.',
      date: '10 de Janeiro, 2026',
      category: 'Segurança',
    },
    {
      id: 3,
      title: 'Otimizando Agendamentos: Métodos Eficazes',
      excerpt: 'Aprenda como organizar melhor o calendário da sua clínica para melhorar a produtividade.',
      date: '5 de Janeiro, 2026',
      category: 'Eficiência',
    },
    {
      id: 4,
      title: 'Transformação Digital em Clínicas Médicas',
      excerpt: 'Por que modernizar seus processos é essencial para o futuro da sua clínica.',
      date: '28 de Dezembro, 2025',
      category: 'Tecnologia',
    },
    {
      id: 5,
      title: 'Relatórios que Impulsionam Decisões',
      excerpt: 'Como usar dados para tomar decisões mais inteligentes no seu consultório.',
      date: '22 de Dezembro, 2025',
      category: 'Análise',
    },
    {
      id: 6,
      title: 'Experiência do Paciente: O Fator Diferencial',
      excerpt: 'Entenda como melhorar a satisfação dos seus pacientes com pequenas mudanças.',
      date: '15 de Dezembro, 2025',
      category: 'Marketing',
    },
  ]

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
          <h1 className="text-4xl font-bold text-white mb-2">Blog ClinicOps</h1>
          <p className="text-green-100">Dicas, insights e artigos sobre gestão de clínicas</p>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {posts.map((post) => (
              <article key={post.id} className="glass-card rounded-3xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-sm font-medium text-green-700 dark:text-green-400">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{post.title}</h3>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter */}
          <div className="glass-card rounded-3xl p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Receba as Novidades</h2>
            <p className="text-muted-foreground mb-6">
              Inscreva-se em nossa newsletter para receber dicas, artigos e atualizações sobre gestão clínica.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu email"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button className="rounded-xl">Inscrever</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
