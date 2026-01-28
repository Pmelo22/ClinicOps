export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  highlighted?: boolean
  limiteUsuarios: number
  limitePacientes: number
  limiteArmazenamentoMb: number
}

export const PLANS: Product[] = [
  {
    id: 'basico',
    name: 'Básico',
    description: 'Ideal para clínicas pequenas iniciando a digitalização',
    priceInCents: 9900, // R$ 99,00
    features: [
      'Até 3 usuários',
      'Até 500 pacientes',
      '1GB de armazenamento',
      'Gestão de pacientes',
      'Agendamento básico',
      'Suporte por email',
    ],
    limiteUsuarios: 3,
    limitePacientes: 500,
    limiteArmazenamentoMb: 1024,
  },
  {
    id: 'profissional',
    name: 'Profissional',
    description: 'Para clínicas em crescimento que precisam de mais recursos',
    priceInCents: 24900, // R$ 249,00
    features: [
      'Até 10 usuários',
      'Até 2.000 pacientes',
      '5GB de armazenamento',
      'Todos os recursos do Básico',
      'Relatórios avançados',
      'Integração com calendário',
      'Suporte prioritário',
    ],
    highlighted: true,
    limiteUsuarios: 10,
    limitePacientes: 2000,
    limiteArmazenamentoMb: 5120,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solução completa para redes de clínicas e hospitais',
    priceInCents: 49900, // R$ 499,00
    features: [
      'Usuários ilimitados',
      'Pacientes ilimitados',
      '20GB de armazenamento',
      'Todos os recursos do Profissional',
      'API de integração',
      'Multi-unidades',
      'Suporte 24/7 dedicado',
      'Treinamento personalizado',
    ],
    limiteUsuarios: 999,
    limitePacientes: 99999,
    limiteArmazenamentoMb: 20480,
  },
]

// Alias for backward compatibility
export const PRODUCTS = PLANS
