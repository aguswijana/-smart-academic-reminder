'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react'

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError('Email atau password salah')
            setLoading(false)
            return
        }

        router.push('/dashboard')
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak sama!')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter!')
            setLoading(false)
            return
        }

        const { error: signUpError } = await supabase.auth.signUp({ email, password })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        // Langsung login setelah daftar
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

        if (loginError) {
            setError('Akun dibuat! Silakan login.')
            setLoading(false)
            return
        }

        router.push('/dashboard')
    }

    const switchMode = (newMode: 'login' | 'register') => {
        setMode(newMode)
        setError('')
        setPassword('')
        setConfirmPassword('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-600 p-4 overflow-hidden">

            <div className="absolute w-72 h-72 bg-pink-400 rounded-full blur-3xl opacity-20 top-0 left-0"></div>
            <div className="absolute w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-20 bottom-0 right-0"></div>

            <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">

                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center border border-white/20 mb-4">
                        <GraduationCap className="text-white" size={38} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-wide">SAR</h1>
                    <p className="text-white/70 mt-1 text-sm">Smart Academic Reminder</p>
                </div>

                {/* Tab */}
                <div className="flex rounded-2xl bg-white/10 p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            mode === 'login' ? 'bg-white/20 text-white shadow' : 'text-white/60 hover:text-white'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            mode === 'register' ? 'bg-white/20 text-white shadow' : 'text-white/60 hover:text-white'
                        }`}
                    >
                        Daftar
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className={`border text-white text-sm rounded-xl p-3 mb-4 text-center ${
                        error.includes('Akun dibuat')
                            ? 'bg-green-500/20 border-green-300'
                            : 'bg-red-500/20 border-red-300'
                    }`}>
                        {error}
                    </div>
                )}

                <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">

                    {/* Email */}
                    <div>
                        <label className="text-white/80 text-sm mb-2 block">Email</label>
                        <div className="flex items-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-4">
                            <Mail size={18} className="text-white/70 flex-shrink-0" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@kamu.com"
                                required
                                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-3 py-4 text-white placeholder:text-white/50 text-sm"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-white/80 text-sm mb-2 block">Password</label>
                        <div className="flex items-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-4">
                            <Lock size={18} className="text-white/70 flex-shrink-0" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-3 py-4 text-white placeholder:text-white/50 text-sm"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} className="text-white/70" /> : <Eye size={18} className="text-white/70" />}
                            </button>
                        </div>
                    </div>

                    {/* Konfirmasi Password - hanya saat register */}
                    {mode === 'register' && (
                        <div>
                            <label className="text-white/80 text-sm mb-2 block">Konfirmasi Password</label>
                            <div className="flex items-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-4">
                                <Lock size={18} className="text-white/70 flex-shrink-0" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-3 py-4 text-white placeholder:text-white/50 text-sm"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={18} className="text-white/70" /> : <Eye size={18} className="text-white/70" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Daftar'}
                    </button>

                    {/* Switch mode */}
                    <p className="text-center text-white/60 text-sm">
                        {mode === 'login' ? (
                            <>Belum punya akun?{' '}
                                <button type="button" onClick={() => switchMode('register')} className="text-white font-semibold hover:underline">
                                    Daftar sekarang
                                </button>
                            </>
                        ) : (
                            <>Sudah punya akun?{' '}
                                <button type="button" onClick={() => switchMode('login')} className="text-white font-semibold hover:underline">
                                    Login
                                </button>
                            </>
                        )}
                    </p>

                </form>
            </div>
        </div>
    )
}