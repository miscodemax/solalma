'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase'
import Loader from '@/app/loading'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Utilisateur connecté, redirige vers dashboard
        router.replace('/')
      } else {
        // Pas connecté, renvoie vers signin ou register
        router.replace('/register')
      }
    }
    checkSession()
  }, [router, supabase])

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <Loader />
    </div>
  )
}
