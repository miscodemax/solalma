

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'


export default function SignupPage() {
    const supabase = createClient()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSignup = async () => {
        setError('')
        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            router.push('/') // ou tu peux afficher une page de confirmation
        }
    }

    const handleGoogleSignup = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`, // ✅ pas /api/...
            }
        });


        if (error) setError(error.message)

    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-bold text-center">Créer un compte</h1>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    className="w-full"
                    onClick={handleSignup}
                    disabled={loading}
                >
                    {loading ? 'Création...' : 'Créer un compte'}
                </Button>

                <div className="text-center text-gray-400">ou</div>

                <Button
                    className="w-full bg-red-500 hover:bg-red-600"
                    onClick={handleGoogleSignup}
                >
                    S’inscrire avec Google
                </Button>
            </div>
        </div>
    )
}
