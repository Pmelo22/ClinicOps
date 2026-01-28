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
        // Check if user already has a profile (completed onboarding)
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('perfil, clinica_id')
          .eq('id', user.id)
          .single()

        // User has completed onboarding - redirect to appropriate dashboard
        if (usuario?.clinica_id) {
          // Update onboarding status
          await supabase.auth.updateUser({
            data: { onboarding_status: 'completed' }
          })
          
          return NextResponse.redirect(`${origin}/dashboard`)
        }

        // User just verified email - needs to complete onboarding
        await supabase.auth.updateUser({
          data: { onboarding_status: 'pending_clinic' }
        })
        
        // Redirect to onboarding if next param points there, otherwise go to onboarding
        if (next === '/onboarding') {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
        return NextResponse.redirect(`${origin}/onboarding`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
