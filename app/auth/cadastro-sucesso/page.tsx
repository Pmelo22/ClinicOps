import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CheckCircle2, Mail } from 'lucide-react'

export const metadata = {
  title: 'Cadastro Realizado - ClinicOps',
}

export default function CadastroSucessoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ClinicOps</span>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl">Cadastro realizado!</CardTitle>
          <CardDescription>
            Sua conta foi criada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
              <Mail className="h-5 w-5" />
              <span className="font-medium">Verifique seu email</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de confirmacao para o seu email. 
              Clique no link para ativar sua conta e começar a usar o sistema.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Seu periodo de teste gratuito de 14 dias comeca agora. 
            Aproveite todos os recursos da plataforma!
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Ir para Login</Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/">Voltar ao Inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
