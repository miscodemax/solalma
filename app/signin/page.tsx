'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const supabase = createClient()
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center">Connexion</h2>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <Button
          className="w-full bg-red-500 hover:bg-red-600"
          onClick={handleGoogleSignIn}
        >
          Connexion avec Google
        </Button>
      </div>
    </div>
  )
}
