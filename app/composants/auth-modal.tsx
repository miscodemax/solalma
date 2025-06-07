// components/AuthModal.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icons } from './icons'
import { Loader2 } from 'lucide-react'

export default function AuthModal() {
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Connexion requise
          </DialogTitle>
        </DialogHeader>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full gap-2 bg-white text-black hover:bg-gray-100 border"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Redirection...
            </>
          ) : (
            <>
              <Icons.google className="h-5 w-5" />
              Continuer avec Google
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
