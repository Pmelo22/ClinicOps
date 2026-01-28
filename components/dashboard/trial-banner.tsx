'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Clock, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface TrialBannerProps {
  createdAt: string
  isTrialActive: boolean
}

export function TrialBanner({ createdAt, isTrialActive }: TrialBannerProps) {
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateTrialStatus = () => {
      const created = new Date(createdAt)
      const trialEndDate = new Date(created.getTime() + 14 * 24 * 60 * 60 * 1000)
      const today = new Date()

      const millisecondsRemaining = trialEndDate.getTime() - today.getTime()
      const daysLeft = Math.ceil(millisecondsRemaining / (1000 * 60 * 60 * 24))

      setDaysRemaining(Math.max(0, daysLeft))

      // Calculate progress (0 = just started, 100 = trial ended)
      const totalDays = 14
      const daysUsed = totalDays - Math.max(0, daysLeft)
      const progressPercent = (daysUsed / totalDays) * 100
      setProgress(Math.min(100, progressPercent))
    }

    calculateTrialStatus()
    const interval = setInterval(calculateTrialStatus, 1000 * 60) // Update every minute

    return () => clearInterval(interval)
  }, [createdAt])

  if (!isTrialActive) {
    return null
  }

  const isExpiringSoon = daysRemaining <= 3

  return (
    <Alert className={`border-2 ${isExpiringSoon ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
      <div className="flex items-start gap-4">
        <div className={`${isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
          {isExpiringSoon ? (
            <AlertCircle className="h-5 w-5 mt-1" />
          ) : (
            <Zap className="h-5 w-5 mt-1" />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <AlertDescription className={`font-semibold ${isExpiringSoon ? 'text-yellow-900' : 'text-green-900'}`}>
              {isExpiringSoon ? (
                <>⚠️ Período grátis termina em {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}</>
              ) : (
                <>✨ Você está utilizando a versão grátis - {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}</>
              )}
            </AlertDescription>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={`${isExpiringSoon ? 'text-yellow-700' : 'text-green-700'}`}>
                <Clock className="inline mr-1 h-4 w-4" />
                Progresso do período grátis
              </span>
              <span className={`font-semibold ${isExpiringSoon ? 'text-yellow-700' : 'text-green-700'}`}>
                {14 - daysRemaining}/14 dias usados
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
              style={{
                background: isExpiringSoon ? '#f3f4f6' : '#f0fdf4'
              }}
            />
          </div>

          <AlertDescription className={`text-sm ${isExpiringSoon ? 'text-yellow-700' : 'text-green-700'}`}>
            {isExpiringSoon ? (
              'Seu período grátis está terminando. Escolha um plano para continuar usando o ClinicOps sem interrupções.'
            ) : (
              'Escolha um dos nossos planos para continuar usando o ClinicOps após o período grátis.'
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
