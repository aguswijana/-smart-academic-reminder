'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Jadwal, Tugas } from '@/lib/types'
import { useReminder } from '@/lib/useReminder'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [jadwalHariIni, setJadwalHariIni] = useState<Jadwal[]>([])
  const [tugasAktif, setTugasAktif] = useState<Tugas[]>([])
  const [dark, setDark] = useState(false)
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useReminder(userId)

  const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const bulanIndo = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const now = new Date()
  const hariIni = hariIndo[now.getDay()]
  const tanggalIni = `${now.getDate()} ${bulanIndo[now.getMonth()]} ${now.getFullYear()}`
  const tanggalLengkap = `${hariIni}, ${tanggalIni}`

  const triggerToast = useCallback((msg: string) => {
    setToast(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('sars-theme')
    if (saved === 'dark') setDark(true)
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Ambil profil dari tabel users
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Tampilkan nama lengkap kalau ada, fallback ke email
      setUserName(profile?.full_name || user.email?.split('@')[0] || 'Pengguna')
      setUserId(user.id)

      const { data: jadwal } = await supabase
        .from('jadwal')
        .select('*')
        .eq('hari', hariIni)
        .order('jam_mulai')

      const { data: tugas } = await supabase
        .from('tugas')
        .select('*, jadwal(*)')
        .neq('status', 'selesai')
        .order('deadline')

      setJadwalHariIni(jadwal || [])
      setTugasAktif(tugas || [])
      setLoading(false)
    }
    checkUser()
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('sars-theme', next ? 'dark' : 'light')
    triggerToast(next ? 'Mode gelap aktif' : 'Mode terang aktif')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    triggerToast('Sampai jumpa!')
    setTimeout(() => router.push('/login'), 800)
  }

  const handleNav = (path: string, label: string) => {
    triggerToast(`Membuka ${label}...`)
    setTimeout(() => router.push(path), 400)
  }

  const selesai = tugasAktif.filter(t => t.status === 'selesai').length
  const progress = tugasAktif.length > 0 ? Math.round((selesai / tugasAktif.length) * 100) : 0

  const c = {
    bg: dark ? 'bg-[#0f0f13]' : 'bg-[#f5f5fa]',
    nav: dark ? 'bg-[#1a1a24] border-[#2a2a3a]' : 'bg-white border-gray-200',
    card: dark ? 'bg-[#1a1a24] border-[#2a2a3a]' : 'bg-white border-gray-100',
    inner: dark ? 'bg-[#12121a]' : 'bg-gray-50',
    text: dark ? 'text-white' : 'text-gray-900',
    sub: dark ? 'text-gray-400' : 'text-gray-500',
  }

  if (loading) return (
    <div className={`min-h-screen ${c.bg} flex flex-col items-center justify-center gap-4`}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full bg-indigo-600 opacity-20 animate-pulse" />
      </div>
      <p className={`${c.sub} text-sm`}>Memuat dashboard...</p>
    </div>
  )

  return (
    <div className={`min-h-screen ${c.bg} transition-colors duration-300`}>

      {/* Toast */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-xl ${
          dark ? 'bg-[#1a1a24] text-white border border-[#2a2a3a]' : 'bg-gray-900 text-white'
        }`}>
          {toast}
        </div>
      </div>

      {/* Navbar */}
      <nav className={`${c.nav} border-b sticky top-0 z-30 px-6 py-4`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
              S
            </div>
            <div>
              <h1 className={`font-bold text-base ${c.text}`}>SARS</h1>
              <p className={`text-xs ${c.sub}`}>Smart Academic Reminder</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl ${c.inner}`}>
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className={`text-sm font-medium ${c.text}`}>{userName}</span>
            </div>
            <button onClick={toggleDark}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all hover:scale-110 ${
                dark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-gray-100 text-gray-500'
              }`}
              title={dark ? 'Mode Terang' : 'Mode Gelap'}>
              {dark ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout}
              className={`text-sm px-4 py-2 rounded-xl font-medium transition ${
                dark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'
              }`}>
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Greeting */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">👋</span>
            <h2 className={`text-2xl font-bold ${c.text}`}>Halo, {userName}!</h2>
          </div>
          <p className={`${c.sub}`}>{tanggalLengkap}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Hari ini', value: hariIni, icon: '🗓️', color: 'from-indigo-500 to-purple-600', sub: tanggalIni },
            { label: 'Jadwal', value: jadwalHariIni.length, icon: '📚', color: 'from-blue-500 to-cyan-500', sub: 'Pelajaran hari ini' },
            { label: 'Tugas aktif', value: tugasAktif.length, icon: '📝', color: 'from-amber-500 to-orange-500', sub: 'Belum selesai' },
            {
              label: 'Deadline',
              value: tugasAktif[0]?.deadline
                ? new Date(tugasAktif[0].deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                : '-',
              icon: '⏰', color: 'from-rose-500 to-pink-600', sub: 'Terdekat'
            },
          ].map(s => (
            <div key={s.label} className={`${c.card} border rounded-2xl p-5 relative overflow-hidden`}>
              <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full bg-gradient-to-br ${s.color} opacity-10`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3 shadow-lg`}>
                {s.icon}
              </div>
              <p className={`text-2xl font-bold ${c.text} mb-0.5`}>{s.value}</p>
              <p className={`text-xs ${c.sub}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {tugasAktif.length > 0 && (
          <div className={`${c.card} border rounded-2xl p-5 mb-6`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`font-semibold ${c.text}`}>Progress Tugas</p>
                <p className={`text-xs ${c.sub}`}>{selesai} dari {tugasAktif.length} tugas selesai</p>
              </div>
              <span className="text-2xl font-bold text-indigo-500">{progress}%</span>
            </div>
            <div className={`h-3 rounded-full ${c.inner} overflow-hidden`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Jadwal Hari Ini */}
          <div className={`${c.card} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">📅</div>
                <h3 className={`font-bold ${c.text}`}>Jadwal Hari Ini</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg ${dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                {hariIni}
              </span>
            </div>
            {jadwalHariIni.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <span className="text-3xl">🎉</span>
                <p className={`${c.sub} text-sm`}>Tidak ada jadwal hari ini</p>
              </div>
            ) : (
              <div className="space-y-2">
                {jadwalHariIni.map(j => (
                  <div key={j.id} className={`flex items-center gap-3 p-3 rounded-xl ${c.inner}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: j.warna }}>
                      {j.mata_pelajaran.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${c.text} truncate`}>{j.mata_pelajaran}</p>
                      <p className={`text-xs ${c.sub}`}>{j.jam_mulai.substring(0,5)} – {j.jam_selesai.substring(0,5)}</p>
                    </div>
                    {j.ruangan && (
                      <span className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 ${dark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        {j.ruangan}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tugas Aktif */}
          <div className={`${c.card} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">📝</div>
                <h3 className={`font-bold ${c.text}`}>Tugas Aktif</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg ${dark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                {tugasAktif.length} tugas
              </span>
            </div>
            {tugasAktif.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <span className="text-3xl">✅</span>
                <p className={`${c.sub} text-sm`}>Semua tugas selesai!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tugasAktif.slice(0, 4).map(t2 => {
                  const isDekat = new Date(t2.deadline).getTime() - Date.now() <= 2 * 86400000
                  return (
                    <div key={t2.id} className={`flex items-center gap-3 p-3 rounded-xl ${c.inner}`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        t2.prioritas === 'tinggi' ? 'bg-red-500' :
                        t2.prioritas === 'normal' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${c.text} truncate`}>{t2.judul}</p>
                        <p className={`text-xs ${isDekat ? 'text-red-500' : c.sub}`}>
                          {isDekat ? '⚠️ ' : ''}
                          {new Date(t2.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 ${
                        t2.status === 'proses'
                          ? dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                          : dark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {t2.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Jadwal', icon: '📅', path: '/jadwal', color: 'from-indigo-500 to-purple-600', desc: 'Kelola jadwal pelajaran' },
            { label: 'Tugas', icon: '📝', path: '/tugas', color: 'from-amber-500 to-orange-500', desc: 'Manajemen tugas' },
            { label: 'Notifikasi', icon: '🔔', path: '/notifikasi', color: 'from-blue-500 to-cyan-500', desc: 'Reminder & alarm' },
            { label: 'Settings', icon: '⚙️', path: '/settings', color: 'from-gray-500 to-slate-600', desc: 'Pengaturan akun' },
          ].map(m => (
            <button key={m.label} onClick={() => handleNav(m.path, m.label)}
              className={`${c.card} border rounded-2xl p-5 text-left hover:border-indigo-400 hover:shadow-lg transition-all duration-200 group`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl mb-3 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                {m.icon}
              </div>
              <p className={`font-bold ${c.text} mb-0.5`}>{m.label}</p>
              <p className={`text-xs ${c.sub}`}>{m.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}