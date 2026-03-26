'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'

export default function AuthPage() {
    const [mode, setMode] = useState('login') // login | signup
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        // LOGIN
        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                setError('Identifiants invalides.')
                setLoading(false)
                return
            }

            router.push('/courtiers/dashboard')
            router.refresh()
            return
        }

        // SIGNUP
        if (!name) {
            setError('Le nom est requis.')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                },
                emailRedirectTo: `${window.location.origin}/courtiers/login`
            }
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage('Compte créé ! tu peux maintenant te connecter')
            setMode('login')
            setName('')
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col antialiased">

            <main className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-sm">

                    <h1 className="text-3xl font-semibold mb-8">
                        {mode === 'login' ? 'Connexion' : 'Créer un compte'}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* NAME (signup only) */}
                        {mode === 'signup' && (
                            <input
                                type="text"
                                placeholder="Nom du courtier"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-red-600"
                            />
                        )}

                        {/* EMAIL */}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-red-600"
                        />

                        {/* PASSWORD */}
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-red-600"
                        />

                        {/* ERROR */}
                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}

                        {/* SUCCESS */}
                        {message && (
                            <p className="text-green-400 text-sm">{message}</p>
                        )}

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 py-3 rounded-full flex items-center justify-center gap-2 transition-all"
                        >
                            {loading
                                ? <Loader2 className="animate-spin" size={18} />
                                : (
                                    <>
                                        {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
                                        <ArrowRight size={16} />
                                    </>
                                )
                            }
                        </button>

                    </form>

                    {/* TOGGLE */}
                    <div className="mt-6 text-sm text-white/50 text-center">
                        {mode === 'login' ? (
                            <>
                                Pas de compte ?{' '}
                                <button
                                    onClick={() => setMode('signup')}
                                    className="text-red-500 hover:underline"
                                >
                                    Créer un compte
                                </button>
                            </>
                        ) : (
                            <>
                                Déjà un compte ?{' '}
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-red-500 hover:underline"
                                >
                                    Se connecter
                                </button>
                            </>
                        )}
                    </div>

                    <p className="text-center text-white/20 text-xs mt-10">
                        Accès réservé aux courtiers autorisés
                    </p>

                </div>
            </main>
        </div>
    )
}