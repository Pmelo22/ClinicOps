'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, AlertCircle, CheckCircle, HardDrive, Users, FileText } from 'lucide-react'
import { PLANS } from '@/lib/products'
import { createPortalSession } from '@/app/actions/stripe'

interface UsoRecursos {
  id: string
  clinica_id: string
  mes_referencia: string
  total_usuarios: number
  total_pacientes: number
  armazenamento_usado_mb: number
  total_atendimentos: number
  created_at: string
  updated_at: string
}

interface SubscriptionCardProps {
  clinicaId: string
  stripePlanId?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  clinicaStatus?: string
  createdAt?: string
  usoRecursos?: UsoRecursos
}

export function SubscriptionCard({
  clinicaId,
  stripePlanId,
  stripeCustomerId,
  stripeSubscriptionId,
  clinicaStatus,
  createdAt,
  usoRecursos,
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)
  const [isOnTrial, setIsOnTrial] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(14)

  const currentPlan = PLANS.find((p) => p.id === stripePlanId)

  useEffect(() => {
    // Calculate if still on trial
    if (createdAt && !stripeSubscriptionId) {
      const created = new Date(createdAt)
      const trialEndDate = new Date(created.getTime() + 14 * 24 * 60 * 60 * 1000)
      const today = new Date()
      const millisecondsRemaining = trialEndDate.getTime() - today.getTime()
      const daysLeft = Math.ceil(millisecondsRemaining / (1000 * 60 * 60 * 24))

      if (daysLeft > 0) {
        setIsOnTrial(true)
        setDaysRemaining(daysLeft)
      }
    }
  }, [createdAt, stripeSubscriptionId])

  const handleOpenPortal = async () => {
    if (!stripeCustomerId) {
      alert('Nenhuma subscrição encontrada')
      return
    }

    setLoading(true)
    try {
      const portalUrl = await createPortalSession(stripeCustomerId)
      if (portalUrl) {
        window.location.href = portalUrl
      }
    } catch (error) {
      console.error('Erro ao abrir portal:', error)
      alert('Erro ao abrir portal de faturamento')
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = () => {
    if (isOnTrial) {
      return {
        label: `Período Grátis - ${daysRemaining} dias`,
        color: 'bg-blue-100 text-blue-800',
        icon: <AlertCircle className="h-4 w-4" />,
      }
    }

    switch (clinicaStatus) {
      case 'ativa':
        return {
          label: 'Ativo',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4" />,
        }
      case 'inadimplente':
        return {
          label: 'Pagamento Pendente',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <AlertCircle className="h-4 w-4" />,
        }
      case 'suspensa':
        return {
          label: 'Suspenso',
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="h-4 w-4" />,
        }
      default:
        return {
          label: 'Sem Plano',
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-4 w-4" />,
        }
    }
  }

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === 999 || limit === 99999) return 0 // Ilimitado
    return Math.round((used / limit) * 100)
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const status = getStatusDisplay()

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano de Assinatura
            </CardTitle>
            <CardDescription>
              {isOnTrial
                ? 'Você está usando a versão grátis. Escolha um plano para continuar após o período de teste.'
                : 'Gerencie sua assinatura e método de pagamento'}
            </CardDescription>
          </div>
          <Badge className={status.color}>
            <div className="flex items-center gap-1">
              {status.icon}
              {status.label}
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plano Atual */}
        {currentPlan ? (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{currentPlan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{currentPlan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  R$ {(currentPlan.priceInCents / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </div>
            </div>

            {/* Principais Features */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {currentPlan.features.slice(0, 4).map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 space-y-3">
            <p className="text-sm font-medium text-yellow-900">
              Você ainda não escolheu um plano. O período grátis terminará em {daysRemaining} dia
              {daysRemaining !== 1 ? 's' : ''}.
            </p>
          </div>
        )}

        {/* Informações de Faturamento */}
        {stripeSubscriptionId && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="font-semibold text-sm text-foreground">Informações de Faturamento</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">ID da Assinatura</p>
                <p className="text-sm font-mono text-foreground break-all">
                  {stripeSubscriptionId.substring(0, 20)}...
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-primary capitalize">{clinicaStatus}</p>
              </div>
            </div>
          </div>
        )}

        {/* Uso de Recursos */}
        {(
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-foreground">Uso de Recursos</h4>
              <p className="text-xs text-muted-foreground">
                Mês atual
              </p>
            </div>

            {/* Usuários */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Usuários</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usoRecursos?.total_usuarios || 0}
                  {currentPlan && ` / ${currentPlan.limiteUsuarios === 999 ? '∞' : currentPlan.limiteUsuarios}`}
                </span>
              </div>
              {currentPlan && currentPlan.limiteUsuarios !== 999 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getUsageColor(
                      getUsagePercentage(usoRecursos?.total_usuarios || 0, currentPlan.limiteUsuarios)
                    )}`}
                    style={{
                      width: `${Math.min(
                        getUsagePercentage(usoRecursos?.total_usuarios || 0, currentPlan.limiteUsuarios),
                        100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Pacientes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Pacientes</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usoRecursos?.total_pacientes || 0}
                  {currentPlan && ` / ${currentPlan.limitePacientes === 99999 ? '∞' : currentPlan.limitePacientes}`}
                </span>
              </div>
              {currentPlan && currentPlan.limitePacientes !== 99999 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getUsageColor(
                      getUsagePercentage(usoRecursos?.total_pacientes || 0, currentPlan.limitePacientes)
                    )}`}
                    style={{
                      width: `${Math.min(
                        getUsagePercentage(usoRecursos?.total_pacientes || 0, currentPlan.limitePacientes),
                        100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Armazenamento */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Armazenamento</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {(usoRecursos?.armazenamento_usado_mb || 0)} MB
                  {currentPlan && ` / ${currentPlan.limiteArmazenamentoMb === 20480 && stripePlanId === 'enterprise' ? '∞' : (currentPlan.limiteArmazenamentoMb / 1024).toFixed(0)} GB`}
                </span>
              </div>
              {currentPlan && (currentPlan.limiteArmazenamentoMb !== 20480 || stripePlanId !== 'enterprise') && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getUsageColor(
                      getUsagePercentage(usoRecursos?.armazenamento_usado_mb || 0, currentPlan.limiteArmazenamentoMb)
                    )}`}
                    style={{
                      width: `${Math.min(
                        getUsagePercentage(usoRecursos?.armazenamento_usado_mb || 0, currentPlan.limiteArmazenamentoMb),
                        100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Alerta se próximo do limite */}
            {currentPlan && (
              getUsagePercentage(usoRecursos?.total_usuarios || 0, currentPlan.limiteUsuarios) >= 75 ||
              getUsagePercentage(usoRecursos?.total_pacientes || 0, currentPlan.limitePacientes) >= 75 ||
              getUsagePercentage(usoRecursos?.armazenamento_usado_mb || 0, currentPlan.limiteArmazenamentoMb) >= 75
            ) && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-900">
                  ⚠️ Você está próximo do limite do seu plano. Considere fazer upgrade para um plano superior.
                </p>
              </div>
            )}

            {/* Comparação de Planos */}
            {!currentPlan && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-900 font-medium">💡 Dica: Use seu consumo atual para escolher o melhor plano</p>
              </div>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-4 border-t border-border">
          {stripeCustomerId ? (
            <>
              <Button
                onClick={handleOpenPortal}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Abrindo Portal...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Gerenciar Cartão e Plano
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button asChild className="flex-1">
              <a href="/checkout/basico">
                <CreditCard className="mr-2 h-4 w-4" />
                Escolher um Plano
              </a>
            </Button>
          )}
        </div>

        {/* Info sobre Portal */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          {stripeCustomerId
            ? 'Você será redirecionado para o portal de faturamento do Stripe onde pode gerenciar seu cartão, atualizar plano e visualizar faturas.'
            : 'Escolha um plano para ativar sua assinatura e adicionar seu cartão de crédito.'}
        </p>
      </CardContent>
    </Card>
  )
}
