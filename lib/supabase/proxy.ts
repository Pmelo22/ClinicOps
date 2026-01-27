import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Update session from request cookies and refresh auth token if needed
 * This is called from middleware to keep the user session active
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  /**
   * IMPORTANT: Do not run code between createServerClient and
   * supabase.auth.getUser(). A simple mistake could make it very hard to debug
   * issues with users being randomly logged out.
   */

  /**
   * IMPORTANT: If you remove getUser() and you use server-side rendering
   * with the Supabase client, your users may be randomly logged out.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas públicas que não requerem autenticação
  const publicRoutes = [
    '/auth/login',
    '/auth/cadastro',
    '/auth/esqueci-senha',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/error',
    '/auth/cadastro-sucesso',
    '/auth/completar-cadastro',
    '/pricing',
    '/',
  ]

  const pathname = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Redirecionar usuários não autenticados
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirecionar usuários autenticados para dashboard (apenas de /auth/login)
  if (user && pathname === '/auth/login') {
    // Verificar se o usuário já tem perfil
    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('clinica_id')
      .eq('auth_user_id', user.id)
      .single()

    // Se não tem perfil ou clínica, redirecionar para completar cadastro
    if (!userProfile || !userProfile.clinica_id) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/cadastro'
      url.searchParams.set('step', 'choose-type')
      return NextResponse.redirect(url)
    }

    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Para usuários autenticados acessando dashboard sem perfil completo
  if (user && pathname.startsWith('/dashboard')) {
    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('clinica_id')
      .eq('auth_user_id', user.id)
      .single()

    // Se não tem perfil ou clínica, redirecionar para completar cadastro
    if (!userProfile || !userProfile.clinica_id) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/cadastro'
      url.searchParams.set('step', 'choose-type')
      return NextResponse.redirect(url)
    }
  }

  // Validar permissões para rotas protegidas específicas (não para /dashboard genérico)
  const dashboardMasterPattern = /^\/dashboard\/master(\/|$)/
  const dashboardAdminPattern = /^\/dashboard\/admin(\/|$)/

  if (user && dashboardMasterPattern.test(pathname)) {
    try {
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('perfil')
        .eq('auth_user_id', user.id)
        .single()

      const userRole = userProfile?.perfil
      const allowedRoles = ['master']

      if (userRole && !allowedRoles.includes(userRole)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Erro ao validar permissões master:', error)
    }
  }

  if (user && dashboardAdminPattern.test(pathname)) {
    try {
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('perfil')
        .eq('auth_user_id', user.id)
        .single()

      const userRole = userProfile?.perfil
      const allowedRoles = ['admin', 'master']

      if (userRole && !allowedRoles.includes(userRole)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Erro ao validar permissões admin:', error)
    }
  }

  /**
   * IMPORTANT: You *must* return the supabaseResponse object as it is.
   * If you're creating a new response object with NextResponse.next() make sure to:
   * 1. Pass the request in it, like so:
   *    const myNewResponse = NextResponse.next({ request })
   * 2. Copy over the cookies, like so:
   *    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
   * 3. Change the myNewResponse object to fit your needs, but avoid changing
   *    the cookies!
   * 4. Finally:
   *    return myNewResponse
   * If this is not done, you may be causing the browser and server to go out
   * of sync and terminate the user's session prematurely!
   */

  return supabaseResponse
}
