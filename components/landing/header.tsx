'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('recursos')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['recursos', 'como-funciona', 'precos']
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          // Se o elemento está visível na viewport (dentro de 200px do topo)
          if (rect.top >= -200 && rect.top <= 300) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center flex-shrink-0 w-1/3">
          <img src="/logo-new.svg" alt="ClinicOps" className="h-10" />
        </Link>

        {/* Center Navigation - With Background */}
        <nav className="hidden md:flex items-center justify-center gap-8 glass rounded-2xl px-4 py-2 flex-1">
          <Link 
            href="#recursos" 
            className={`text-sm font-medium transition-colors ${
              activeSection === 'recursos' 
                ? 'text-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recursos
          </Link>
          <Link 
            href="#como-funciona" 
            className={`text-sm font-medium transition-colors ${
              activeSection === 'como-funciona' 
                ? 'text-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Como Funciona
          </Link>
          <Link 
            href="#precos" 
            className={`text-sm font-medium transition-colors ${
              activeSection === 'precos' 
                ? 'text-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Preços
          </Link>
        </nav>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center justify-end gap-3 flex-shrink-0 w-1/3">
          <Button variant="ghost" asChild className="rounded-xl">
            <Link href="/auth/login">Entrar</Link>
          </Button>
          <Button asChild className="rounded-xl shadow-lg shadow-primary/25">
            <Link href="/auth/cadastro">Começar Grátis</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 glass rounded-2xl px-6 py-4">
          <div className="flex flex-col gap-4">
            <Link 
              href="#recursos" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Recursos
            </Link>
            <Link 
              href="#como-funciona" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Como Funciona
            </Link>
            <Link 
              href="#precos" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Preços
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
              <Button variant="ghost" asChild className="justify-start rounded-xl">
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link href="/auth/cadastro">Começar Gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
