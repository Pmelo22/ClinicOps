'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Loader2, ArrowLeft, Building2, Gift } from 'lucide-react'
import type { OwnerFormData } from '@/lib/types/signup'
import { PRODUCTS } from '@/lib/products'

interface StepOwnerFormProps {
  onSubmit: (_data: OwnerFormData) => Promise<void>
  onBack: () => void
  onValidateCNPJ: (_cnpj: string) => Promise<{ valid: boolean; error?: string }>
  isLoading: boolean
  error: string | null
}

export function StepOwnerForm({
  onSubmit,
  onBack,
  onValidateCNPJ,
  isLoading,
  error
}: StepOwnerFormProps) {
  const [formData, setFormData] = useState({
    nomeClinica: '',
    cnpj: '',
    telefone: '',
    planoId: 'profissional',
  })
  const [localError, setLocalError] = useState<string | null>(null)
  const [cnpjValidating, setCnpjValidating] = useState(false)
  const [cnpjValid, setCnpjValid] = useState<boolean | null>(null)

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    setLocalError(null)
    if (field === 'cnpj') {
      setCnpjValid(null)
    }
  }

  // Formatar CNPJ
  function formatCNPJ(value: string) {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  // Formatar telefone
  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return numbers
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  // Validar CNPJ quando completo
  async function handleCNPJBlur() {
    const cnpjNumbers = formData.cnpj.replace(/\D/g, '')
    if (cnpjNumbers.length !== 14) return

    setCnpjValidating(true)
    try {
      const result = await onValidateCNPJ(cnpjNumbers)
      setCnpjValid(result.valid)
      if (!result.valid) {
        setLocalError(result.error || 'CNPJ inválido ou já cadastrado')
      }
    } catch {
      setLocalError('Erro ao validar CNPJ')
    } finally {
      setCnpjValidating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)

    // Validações
    if (!formData.nomeClinica.trim()) {
      setLocalError('Nome da clínica é obrigatório')
      return
    }

    const cnpjNumbers = formData.cnpj.replace(/\D/g, '')
    if (cnpjNumbers.length !== 14) {
      setLocalError('CNPJ inválido')
      return
    }

    if (cnpjValid === false) {
      setLocalError('CNPJ já cadastrado em outra clínica')
      return
    }

    await onSubmit({
      nomeClinica: formData.nomeClinica.trim(),
      cnpj: cnpjNumbers,
      telefone: formData.telefone.replace(/\D/g, '') || undefined,
      planoId: formData.planoId,
    })
  }

  const displayError = localError || error

  // Calcular data fim trial
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 14)
  const trialEndFormatted = trialEndDate.toLocaleDateString('pt-BR')

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ClinicOps</span>
        </div>
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
          <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl">Cadastrar clínica</CardTitle>
        <CardDescription>
          Informe os dados básicos da sua clínica
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Banner Trial */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  14 dias grátis para testar!
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Seu trial termina em {trialEndFormatted}. Sem necessidade de cartão.
                </p>
              </div>
            </div>
          </div>

          {displayError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {displayError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nomeClinica">Nome da clínica</Label>
            <Input
              id="nomeClinica"
              placeholder="Clínica Exemplo LTDA"
              value={formData.nomeClinica}
              onChange={e => handleChange('nomeClinica', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <div className="relative">
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={e => handleChange('cnpj', formatCNPJ(e.target.value))}
                onBlur={handleCNPJBlur}
                disabled={isLoading}
                className={cnpjValid === true ? 'border-green-500' : cnpjValid === false ? 'border-red-500' : ''}
                required
              />
              {cnpjValidating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cada CNPJ pode ter apenas uma clínica cadastrada
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone (opcional)</Label>
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={e => handleChange('telefone', formatPhone(e.target.value))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plano">Plano</Label>
            <Select
              value={formData.planoId}
              onValueChange={value => handleChange('planoId', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{product.name}</span>
                      <span className="text-muted-foreground ml-2">
                        R$ {(product.priceInCents / 100).toFixed(0)}/mês
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Você poderá alterar o plano a qualquer momento
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando clínica...
              </>
            ) : (
              'Criar minha clínica'
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
