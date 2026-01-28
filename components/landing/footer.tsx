import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <img src="/logo-new.svg" alt="ClinicOps" className="h-10 brightness-0 invert" />
            </Link>
            <p className="text-white/80 leading-relaxed">
              Plataforma completa para gestão de clínicas médicas com foco em segurança e eficiência.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-6">Produto</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#recursos" className="text-white/70 hover:text-white transition-colors">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="#precos" className="text-white/70 hover:text-white transition-colors">
                  Precos
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="text-white/70 hover:text-white transition-colors">
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-6">Empresa</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/empresa/sobre" className="text-white/70 hover:text-white transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/empresa/blog" className="text-white/70 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/empresa/contato" className="text-white/70 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/legal/privacidade" className="text-white/70 hover:text-white transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/legal/termos" className="text-white/70 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/legal/lgpd" className="text-white/70 hover:text-white transition-colors">
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/80">
            2026 ClinicOps. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="https://www.linkedin.com/in/pmelo22" target="_blank" className="text-white/70 hover:text-white transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
