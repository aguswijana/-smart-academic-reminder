'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    GraduationCap
} from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

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

        const { error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setError('Cek email kamu untuk konfirmasi!')
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-600 p-4 overflow-hidden">

            {/* Blur Background */}
            <div className="absolute w-72 h-72 bg-pink-400 rounded-full blur-3xl opacity-20 top-0 left-0"></div>
            <div className="absolute w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-20 bottom-0 right-0"></div>

            {/* Card */}
            <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center border border-white/20 mb-5">
                        <GraduationCap className="text-white" size={42} />
                    </div>

                    <h1 className="text-5xl font-bold text-white tracking-wide">
                        SAR
                    </h1>

                    <p className="text-white/70 mt-2">
                        Smart Academic Reminder
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/20 border border-red-300 text-white text-sm rounded-xl p-3 mb-4 text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-5">

                   {/* Email */}
<div>
    <label className="text-white/80 text-sm mb-2 block">
        Email
    </label>

    <div className="flex items-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-4">

        <Mail size={18} className="text-white/70" />

        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            className="
                w-full
                bg-transparent
                border-none
                outline-none
                focus:outline-none
                focus:ring-0
                px-3
                py-4
                text-white
                placeholder:text-white/50
            "
        />
    </div>
</div>

                    {/* Password */}
<div>
    <label className="text-white/80 text-sm mb-2 block">
        Password
    </label>

    <div className="flex items-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-4">

        <Lock size={18} className="text-white/70" />

        <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="
                w-full
                bg-transparent
                border-none
                outline-none
                focus:outline-none
                focus:ring-0
                px-3
                py-4
                text-white
                placeholder:text-white/50
            "
        />

        <button
            type="button"
            onClick={() =>
                setShowPassword(!showPassword)
            }
        >
            {showPassword ? (
                <EyeOff
                    size={18}
                    className="text-white/70"
                />
            ) : (
                <Eye
                    size={18}
                    className="text-white/70"
                />
            )}
        </button>
    </div>
</div>

                    {/* Remember */}
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 text-white/70">
                            <input type="checkbox" />
                            Remember me
                        </label>

                        <button
                            type="button"
                            className="text-white hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>
{/* Login */}
<button
    onClick={handleLogin}
    disabled={loading}
    className="
        w-full
        py-4
        rounded-2xl
        bg-white/10
        backdrop-blur-md
        border
        border-white/20
        text-white
        font-bold
        text-lg
        hover:bg-white/20
        hover:scale-[1.02]
        transition-all
        duration-300
        shadow-lg
        disabled:opacity-50
    "
>
    {loading ? 'Loading...' : 'Login'}
</button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/20"></div>
                        <span className="text-white/50 text-sm">atau</span>
                        <div className="flex-1 h-px bg-white/20"></div>
                    </div>
                </form>
            </div>
        </div>
    )
}
                  