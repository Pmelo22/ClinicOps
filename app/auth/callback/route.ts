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
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('perfil')
          .eq('auth_user_id', user.id)
          .single()

        // Redirect based on user role
        if (usuario?.perfil === 'master') {
          return NextResponse.redirect(`${origin}/dashboard/master`)
        } else if (usuario?.perfil === 'admin_tenant') {
          return NextResponse.redirect(`${origin}/dashboard/admin`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
