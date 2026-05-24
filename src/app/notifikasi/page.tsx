'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Notification } from '@/lib/types'

type FilterType = 'semua' | 'belum_dibaca' | 'jadwal_harian' | 'deadline_h2' | 'deadline_hari_h' | 'tugas_aktif'

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(false)
  const [filter, setFilter] = useState<FilterType>('semua')
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
      fetchNotifs()
    }
    checkUser()
  }, [])

  const fetchNotifs = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    setNotifs(data || [])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    triggerToast('Notifikasi ditandai dibaca')
  }

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    triggerToast('Semua notifikasi ditandai dibaca')
  }

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifs(prev => prev.filter(n => n.id !== id))
    triggerToast('Notifikasi dihapus')
  }

  const deleteAll = async () => {
    if (!confirm('Hapus semua notifikasi?')) return
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setNotifs([])
    triggerToast('Semua notifikasi dihapus')
  }

  const toggleDark = () => {
    setDark(prev => {
      localStorage.setItem('sars-theme', !prev ? 'dark' : 'light')
      return !prev
    })
  }

  const filtered = notifs.filter(n => {
    if (filter === 'semua') return true
    if (filter === 'belum_dibaca') return !n.is_read
    return n.tipe === filter
  })

  const unreadCount = notifs.filter(n => !n.is_read).length

  const tipeConfig: Record<string, { icon: string; color: string; label: string }> = {
    jadwal_harian: { icon: '📅', color: 'from-blue-500 to-cyan-500', label: 'Jadwal Harian' },
    tugas_aktif: { icon: '📝', color: 'from-amber-500 to-orange-500', label: 'Tugas Aktif' },
    deadline_h2: { icon: '⚠️', color: 'from-orange-500 to-red-500', label: 'Deadline H-2' },
    deadline_hari_h: { icon: '🔥', color: 'from-red-500 to-pink-600', label: 'Deadline Hari H' },
  }

  const formatWaktu = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const menit = Math.floor(diff / 60000)
    const jam = Math.floor(diff / 3600000)
    const hari = Math.floor(diff / 86400000)
    if (menit < 1) return 'Baru saja'
    if (menit < 60) return `${menit} menit lalu`
    if (jam < 24) return `${jam} jam lalu`
    if (hari < 7) return `${hari} hari lalu`
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const c = {
    bg: dark ? 'bg-[#0f0f13]' : 'bg-[#f5f5fa]',
    nav: dark ? 'bg-[#1a1a24] border-[#2a2a3a]' : 'bg-white border-gray-200',
    card: dark ? 'bg-[#1a1a24] border-[#2a2a3a]' : 'bg-white border-gray-100',
    inner: dark ? 'bg-[#12121a]' : 'bg-gray-50',
    text: dark ? 'text-white' : 'text-gray-900',
    sub: dark ? 'text-gray-400' : 'text-gray-500',
    chip: dark ? 'bg-[#12121a] text-gray-300 border-[#2a2a3a]' : 'bg-white text-gray-600 border-gray-200',
    chipActive: 'bg-indigo-600 text-white border-indigo-600',
  }

  if (loading) return (
    <div className={`min-h-screen ${c.bg} flex flex-col items-center justify-center gap-4`}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full bg-indigo-600 opacity-20 animate-pulse" />
      </div>
      <p className={`${c.sub} text-sm`}>Memuat notifikasi...</p>
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')}
              className={`${c.sub} hover:text-indigo-500 transition text-sm font-medium`}>
              ← Dashboard
            </button>
            <div className={`w-px h-5 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div>
              <h1 className={`font-bold text-base ${c.text}`}>Notifikasi</h1>
              <p className={`text-xs ${c.sub}`}>
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all hover:scale-110 ${
                dark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-gray-100 text-gray-500'
              }`}>
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total', value: notifs.length, icon: '🔔', color: 'from-indigo-500 to-purple-600' },
            { label: 'Belum Dibaca', value: unreadCount, icon: '📬', color: 'from-amber-500 to-orange-500' },
            { label: 'Sudah Dibaca', value: notifs.length - unreadCount, icon: '✅', color: 'from-emerald-500 to-teal-500' },
          ].map(s => (
            <div key={s.label} className={`${c.card} border rounded-2xl p-4 relative overflow-hidden`}>
              <div className={`absolute -right-3 -top-3 w-14 h-14 rounded-full bg-gradient-to-br ${s.color} opacity-10`} />
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-base mb-2 shadow-lg`}>
                {s.icon}
              </div>
              <p className={`text-xl font-bold ${c.text}`}>{s.value}</p>
              <p className={`text-xs ${c.sub}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        {notifs.length > 0 && (
          <div className="flex gap-2 mb-4 justify-end">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}
                className={`text-xs px-4 py-2 rounded-xl font-medium transition ${
                  dark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}>
                ✓ Tandai semua dibaca
              </button>
            )}
            <button onClick={deleteAll}
              className={`text-xs px-4 py-2 rounded-xl font-medium transition ${
                dark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'
              }`}>
              🗑️ Hapus semua
            </button>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { key: 'semua', label: '🗓 Semua' },
            { key: 'belum_dibaca', label: `📬 Belum Dibaca ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
            { key: 'jadwal_harian', label: '📅 Jadwal' },
            { key: 'deadline_h2', label: '⚠️ H-2' },
            { key: 'deadline_hari_h', label: '🔥 Hari H' },
            { key: 'tugas_aktif', label: '📝 Tugas' },
          ] as { key: FilterType; label: string }[]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex-shrink-0 ${
                filter === f.key ? c.chipActive : c.chip
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List Notifikasi */}
        {filtered.length === 0 ? (
          <div className={`${c.card} border rounded-3xl flex flex-col items-center justify-center py-24 gap-4`}>
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-4xl">
              🔔
            </div>
            <div className="text-center">
              <p className={`font-semibold ${c.text} mb-1`}>Tidak ada notifikasi</p>
              <p className={`text-sm ${c.sub}`}>Notifikasi akan muncul di sini</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(n => {
              const cfg = tipeConfig[n.tipe] || { icon: '🔔', color: 'from-gray-500 to-slate-600', label: n.tipe }
              return (
                <div key={n.id}
                  className={`${c.card} border rounded-2xl p-4 flex items-start gap-4 transition-all duration-200 hover:border-indigo-400 ${
                    !n.is_read ? dark ? 'border-indigo-500/30' : 'border-indigo-200' : ''
                  }`}>
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                        dark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {cfg.label}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-sm font-medium ${c.text} mb-1`}>{n.pesan}</p>
                    <p className={`text-xs ${c.sub}`}>{formatWaktu(n.created_at)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!n.is_read && (
                      <button onClick={() => markAsRead(n.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl transition ${
                          dark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}>
                        ✓ Baca
                      </button>
                    )}
                    <button onClick={() => deleteNotif(n.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl transition ${
                        dark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}>
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}