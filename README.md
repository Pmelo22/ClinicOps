# ClinicOps

> Plataforma SaaS completa para gestão de clínicas médicas

[![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

## 🚀 Características

- ✅ Autenticação com Supabase
- ✅ Dashboard responsivo e moderno
- ✅ Gestão de pacientes e atendimentos
- ✅ Controle de acesso por perfil (Master, Admin, Usuário)
- ✅ Interface escura/clara com Next Themes
- ✅ Integração com Stripe para pagamentos
- ✅ Componentes UI reutilizáveis (Radix UI)
- ✅ TypeScript para segurança de tipos
- ✅ Suporte LGPD

## 📋 Pré-requisitos

- **Node.js**: >= 18.17
- **pnpm**: >= 9.0 (gerenciador de pacotes)
- **Conta Supabase**: [supabase.com](https://supabase.com)
- **Git**: para controle de versão

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Pmelo22/ClinicOps.git
cd ClinicOps
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env.local
```

**Variáveis obrigatórias** (no `.env.local`):

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica

# Banco de dados (opcional - apenas para desenvolvimento)
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Chaves secretas (apenas server-side - NUNCA no cliente)
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
SUPABASE_SECRET_KEY=sua-chave-secreta
```

### 4. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse a aplicação em `http://localhost:3000`

## 📦 Comandos disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor de desenvolvimento

# Build e produção
pnpm build        # Cria build otimizado
pnpm start        # Inicia servidor em produção

# Qualidade de código
pnpm lint         # Executa ESLint
```

## 🗂️ Estrutura do Projeto

```
ClinicOps/
├── app/                      # App Router (Next.js 13+)
│   ├── auth/                 # Rotas de autenticação
│   ├── dashboard/            # Dashboard privado
│   ├── pricing/              # Página de preços
│   ├── actions/              # Server Actions
│   ├── layout.tsx            # Layout raiz
│   └── page.tsx              # Página inicial
│
├── components/               # Componentes React reutilizáveis
│   ├── ui/                   # Componentes UI (Radix UI)
│   ├── dashboard/            # Componentes do dashboard
│   └── landing/              # Componentes da landing page
│
├── lib/                      # Utilitários e configuração
│   ├── supabase/             # Clientes Supabase (client/server)
│   ├── config.ts             # Configurações do app
│   ├── types.ts              # Tipos TypeScript
│   └── utils.ts              # Funções utilitárias
│
├── hooks/                    # Custom React Hooks
├── public/                   # Arquivos estáticos
├── styles/                   # Estilos globais
├── scripts/                  # Scripts úteis (DB, etc)
├── middleware.ts             # Middleware do Next.js
└── tsconfig.json             # Configuração TypeScript
```

## 🔐 Segurança

- ✅ Environment variables protegidas (`.env.local` no gitignore)
- ✅ Server-side authentication com Supabase
- ✅ Middleware para proteção de rotas
- ✅ CORS configurado
- ✅ CSP headers
- ✅ Strict mode TypeScript

## 🌐 Deployment

### Vercel (Recomendado)

1. Faça push no GitHub
2. Conecte o repositório em [vercel.com](https://vercel.com)
3. Adicione variáveis de ambiente no dashboard do Vercel
4. Deploy automático em cada push

```bash
# Deploy manual
pnpm build
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 📚 Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.0.10 | Framework React |
| React | 19.2.0 | Library UI |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4.1.9 | Estilos |
| Supabase | latest | Backend/Auth |
| Radix UI | latest | Componentes base |
| React Hook Form | 7.60.0 | Forms |
| Zod | 3.25.76 | Validação |
| Recharts | 2.15.4 | Gráficos |

## 🧪 Testes

```bash
# Será adicionado em breve
# pnpm test
```

## 📖 Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Pmelo22** - Desenvolvedor principal

## 📧 Contato

Para dúvidas ou sugestões, abra uma [Issue](https://github.com/Pmelo22/ClinicOps/issues)

---

**Desenvolvido com ❤️ para a comunidade de saúde**