import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Verificar se o usuário já tem um perfil na tabela usuarios
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('perfil, clinica_id')
          .eq('id', user.id)
          .single()

        // Se o usuário NÃO tem perfil, significa que precisa completar o cadastro
        // Redirecionar para a página de escolher tipo (funcionário ou dono)
        if (!usuario) {
          // Salvar o email verificado (OAuth já verifica email automaticamente)
          return NextResponse.redirect(`${origin}/auth/cadastro?step=choose-type&oauth=true`)
        }

        // Se o usuário não tem clínica associada, precisa escolher o tipo
        if (!usuario.clinica_id) {
          return NextResponse.redirect(`${origin}/auth/cadastro?step=choose-type`)
        }

        // Redirect based on user role
        if (usuario?.perfil === 'master') {
          return NextResponse.redirect(`${origin}/dashboard/master`)
        } else if (usuario?.perfil === 'admin') {
          return NextResponse.redirect(`${origin}/dashboard/admin`)
        }

        return NextResponse.redirect(`${origin}/dashboard`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
