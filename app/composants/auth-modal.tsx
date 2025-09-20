'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icons } from './icons'
import { Loader2, AlertCircle } from 'lucide-react'

export default function AuthModal() {
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(window.location.pathname)}`
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md animate-in fade-in zoom-in-95 duration-300 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Bienvenue 👋
          </DialogTitle>
          <p className="text-center text-sm text-gray-500 mt-1">
            Connectez-vous pour continuer et profiter pleinement de la plateforme.
          </p>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm mt-3">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            aria-label="Se connecter avec Google"
            className="w-full gap-2 bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-sm transition-all rounded-lg py-5 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 text-gray-600" />
                Redirection...
              </>
            ) : (
              <>
                <Icons.google className="h-5 w-5 text-[#EA4335]" />
                Continuer avec Google
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Nous n’accédons jamais à vos emails ou contacts sans votre accord.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
