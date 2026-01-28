'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, CheckCircle2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Check if user already has a clinic
      supabase
        .from('usuarios')
        .select('id, clinica_id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.clinica_id) {
            router.push('/dashboard')
          }
        })
      
      setUserName(user.user_metadata?.nome || 'Usuário')
      
      // Update onboarding status
      supabase.auth.updateUser({
        data: { onboarding_status: 'pending_clinic' }
      })
    })
  }, [router])

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-2xl relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo-new.svg" alt="ClinicOps" className="h-12" />
        </Link>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-primary mt-2">Conta criada</span>
            </div>
            <div className="w-16 h-0.5 bg-primary mx-2 mt-[-20px]" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-primary mt-2">Verificado</span>
            </div>
            <div className="w-16 h-0.5 bg-primary mx-2 mt-[-20px]" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold animate-pulse">
                3
              </div>
              <span className="text-xs font-medium text-foreground mt-2">Configurar</span>
            </div>
          </div>
        </div>

        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              Olá, {userName}! Bem-vindo ao ClinicOps
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Como você gostaria de começar?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Option cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Join existing clinic */}
              <button
                onClick={() => router.push('/onboarding/entrar-clinica')}
                className="glass-card p-6 rounded-2xl text-left hover:ring-2 hover:ring-primary/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Entrar em uma clínica
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tenho um código de convite de uma clínica existente
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  Usar código de convite
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Create new clinic */}
              <button
                onClick={() => router.push('/onboarding/criar-clinica')}
                className="glass-card p-6 rounded-2xl text-left hover:ring-2 hover:ring-primary/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Criar uma nova clínica
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sou dono/administrador e quero cadastrar minha clínica
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  Cadastrar clínica
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Info box */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Não tem certeza?</strong> Se você foi convidado por alguém, escolha "Entrar em uma clínica". 
                Se você é o responsável pela clínica, escolha "Criar uma nova clínica".
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Precisa de ajuda?{' '}
          <Link href="#" className="text-primary hover:underline font-medium">
            Entre em contato com nosso suporte
          </Link>
        </p>
      </div>
    </div>
  )
}
