'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Building2, Users, ArrowRight } from 'lucide-react'

interface StepChooseTypeProps {
  onChoose: (_type: 'employee' | 'owner') => void
  isLoading: boolean
  userName?: string
}

export function StepChooseType({
  onChoose,
  isLoading,
  userName
}: StepChooseTypeProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ClinicOps</span>
        </div>
        <CardTitle className="text-2xl">
          {userName ? `Olá, ${userName.split(' ')[0]}!` : 'Bem-vindo!'}
        </CardTitle>
        <CardDescription>
          Como você deseja usar o ClinicOps?
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Opção: Entrar em clínica existente (Funcionário) */}
        <button
          onClick={() => onChoose('employee')}
          disabled={isLoading}
          className="w-full p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Entrar em uma clínica
                </h3>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-muted-foreground">
                Você recebeu um código de convite do proprietário da clínica onde trabalha
              </p>
              <div className="pt-2">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  Para funcionários
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Opção: Criar nova clínica (Proprietário) */}
        <button
          onClick={() => onChoose('owner')}
          disabled={isLoading}
          className="w-full p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Criar minha clínica
                </h3>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-muted-foreground">
                Você é proprietário ou responsável e deseja cadastrar sua clínica
              </p>
              <div className="pt-2 flex gap-2">
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                  Para proprietários
                </span>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">
                  14 dias grátis
                </span>
              </div>
            </div>
          </div>
        </button>

        <p className="text-xs text-center text-muted-foreground pt-4">
          Você poderá alterar sua função posteriormente dentro da plataforma
        </p>
      </CardContent>
    </Card>
  )
}
