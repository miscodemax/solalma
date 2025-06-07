'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase'
import Loader from '@/app/loading'

export const dynamic = 'force-dynamic'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      const redirectTo = searchParams.get('redirect') || '/'

      if (session) {
        // Redirige l'utilisateur là où il voulait aller
        router.replace(redirectTo)
      } else {
        // Sinon, envoie vers la page d'inscription
        router.replace('/register')
      }
    }

    checkSession()
  }, [router, supabase, searchParams])

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <Loader />
    </div>
  )
}
