'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dark, setDark] = useState(false)
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [activeTab, setActiveTab] = useState<'profil' | 'notifikasi' | 'akun'>('profil')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
  })
  const [notifSettings, setNotifSettings] = useState({
    reminder_jadwal: true,
    reminder_h2: true,
    reminder_hari_h: true,
    sound_alarm: true,
  })
  const [passwordForm, setPasswordForm] = useState({
    password_baru: '',
    konfirmasi_password: '',
  })
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
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setForm({
        full_name: profile?.full_name || '',
        email: user.email || '',
        avatar_url: profile?.avatar_url || '',
      })
      const savedNotif = localStorage.getItem('sars-notif-settings')
      if (savedNotif) setNotifSettings(JSON.parse(savedNotif))
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

  const handleSaveProfil = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('users')
      .update({ full_name: form.full_name, avatar_url: form.avatar_url })
      .eq('id', user.id)
    setSaving(false)
    if (error) { triggerToast('❌ Gagal menyimpan profil'); return }
    triggerToast('✅ Profil berhasil disimpan!')
  }

  const handleSaveNotif = () => {
    localStorage.setItem('sars-notif-settings', JSON.stringify(notifSettings))
    triggerToast('✅ Pengaturan notifikasi disimpan!')
  }

  const handleChangePassword = async () => {
    if (!passwordForm.password_baru) { triggerToast('❌ Password baru wajib diisi!'); return }
    if (passwordForm.password_baru !== passwordForm.konfirmasi_password) {
      triggerToast('❌ Password tidak cocok!')
      return
    }
    if (passwordForm.password_baru.length < 6) {
      triggerToast('❌ Password minimal 6 karakter!')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password_baru })
    setSaving(false)
    if (error) { triggerToast('❌ Gagal ubah password: ' + error.message); return }
    setPasswordForm({ password_baru: '', konfirmasi_password: '' })
    triggerToast('✅ Password berhasil diubah!')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    triggerToast('Sampai jumpa!')
    setTimeout(() => router.push('/login'), 800)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Yakin hapus akun? Semua data akan hilang permanen!')) return
    if (!confirm('Konfirmasi sekali lagi — hapus akun secara permanen?')) return
    triggerToast('Fitur ini memerlukan konfirmasi admin')
  }

  const c = {
    bg: dark ? 'bg-[#0f0f13]' : 'bg-[#f5f5fa]',
    nav: dark ? 'bg-[#1a1a24] border-[#2a2a3a]' : 'bg-white border-gray-200',
    card: dark ? 'bg-[#1a1a24] border-[#2a2a3a]' : 'bg-white border-gray-100',
    inner: dark ? 'bg-[#12121a]' : 'bg-gray-50',
    text: dark ? 'text-white' : 'text-gray-900',
    sub: dark ? 'text-gray-400' : 'text-gray-500',
    inp: dark ? 'bg-[#12121a] border-[#2a2a3a] text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400',
    btn: dark ? 'bg-[#12121a] text-gray-300 hover:bg-[#2a2a3a]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  }

  if (loading) return (
    <div className={`min-h-screen ${c.bg} flex flex-col items-center justify-center gap-4`}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full bg-indigo-600 opacity-20 animate-pulse" />
      </div>
      <p className={`${c.sub} text-sm`}>Memuat settings...</p>
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
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')}
              className={`${c.sub} hover:text-indigo-500 transition text-sm font-medium`}>
              ← Dashboard
            </button>
            <div className={`w-px h-5 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div>
              <h1 className={`font-bold text-base ${c.text}`}>Settings</h1>
              <p className={`text-xs ${c.sub}`}>Kelola akun & preferensi</p>
            </div>
          </div>
          <button onClick={toggleDark}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all hover:scale-110 ${
              dark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-gray-100 text-gray-500'
            }`}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Profile Card */}
        <div className={`${c.card} border rounded-3xl p-6 mb-6 flex items-center gap-5`}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 flex-shrink-0">
            {form.full_name ? form.full_name.charAt(0).toUpperCase() : form.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-lg ${c.text} truncate`}>{form.full_name || 'Pengguna SARS'}</p>
            <p className={`text-sm ${c.sub} truncate`}>{form.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-lg mt-1 inline-block ${dark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              Akun Aktif
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${c.inner}`}>
          {([
            { key: 'profil', icon: '👤', label: 'Profil' },
            { key: 'notifikasi', icon: '🔔', label: 'Notifikasi' },
            { key: 'akun', icon: '🔐', label: 'Akun' },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : `${c.sub} hover:${c.text}`
              }`}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Profil */}
        {activeTab === 'profil' && (
          <div className={`${c.card} border rounded-3xl p-6 space-y-4`}>
            <h2 className={`font-bold ${c.text} mb-4`}>Informasi Profil</h2>
            <div>
              <label className={`text-xs font-semibold uppercase tracking-wider ${c.sub}`}>Nama Lengkap</label>
              <input value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${c.inp}`}
                placeholder="Masukkan nama lengkap" />
            </div>
            <div>
              <label className={`text-xs font-semibold uppercase tracking-wider ${c.sub}`}>Email</label>
              <input value={form.email} disabled
                className={`w-full border rounded-xl px-4 py-3 mt-2 opacity-50 cursor-not-allowed ${c.inp}`} />
              <p className={`text-xs ${c.sub} mt-1`}>Email tidak dapat diubah</p>
            </div>
            <div>
              <label className={`text-xs font-semibold uppercase tracking-wider ${c.sub}`}>URL Avatar (opsional)</label>
              <input value={form.avatar_url}
                onChange={e => setForm({ ...form, avatar_url: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${c.inp}`}
                placeholder="https://..." />
            </div>
            <button onClick={handleSaveProfil} disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              {saving ? '⏳ Menyimpan...' : '💾 Simpan Profil'}
            </button>
          </div>
        )}

        {/* Tab: Notifikasi */}
        {activeTab === 'notifikasi' && (
          <div className={`${c.card} border rounded-3xl p-6 space-y-4`}>
            <h2 className={`font-bold ${c.text} mb-4`}>Pengaturan Notifikasi</h2>
            {[
              { key: 'reminder_jadwal', icon: '📅', label: 'Reminder Jadwal Harian', desc: 'Notifikasi 5 menit sebelum pelajaran mulai' },
              { key: 'reminder_h2', icon: '⚠️', label: 'Reminder Deadline H-2', desc: 'Peringatan 2 hari sebelum deadline tugas' },
              { key: 'reminder_hari_h', icon: '🔥', label: 'Reminder Deadline Hari H', desc: 'Peringatan di hari deadline tugas' },
              { key: 'sound_alarm', icon: '🔊', label: 'Suara Alarm', desc: 'Bunyi alarm saat deadline hari H tiba' },
            ].map(item => (
              <div key={item.key} className={`flex items-center justify-between p-4 rounded-2xl ${c.inner}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className={`font-medium text-sm ${c.text}`}>{item.label}</p>
                    <p className={`text-xs ${c.sub}`}>{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    notifSettings[item.key as keyof typeof notifSettings]
                      ? 'bg-indigo-600' : dark ? 'bg-gray-700' : 'bg-gray-300'
                  }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                    notifSettings[item.key as keyof typeof notifSettings] ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
            <button onClick={handleSaveNotif}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              💾 Simpan Pengaturan
            </button>
          </div>
        )}

        {/* Tab: Akun */}
        {activeTab === 'akun' && (
          <div className="space-y-4">
            {/* Ganti Password */}
            <div className={`${c.card} border rounded-3xl p-6 space-y-4`}>
              <h2 className={`font-bold ${c.text}`}>Ganti Password</h2>
              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider ${c.sub}`}>Password Baru</label>
                <input type="password" value={passwordForm.password_baru}
                  onChange={e => setPasswordForm({ ...passwordForm, password_baru: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${c.inp}`}
                  placeholder="Minimal 6 karakter" />
              </div>
              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider ${c.sub}`}>Konfirmasi Password</label>
                <input type="password" value={passwordForm.konfirmasi_password}
                  onChange={e => setPasswordForm({ ...passwordForm, konfirmasi_password: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${c.inp}`}
                  placeholder="Ulangi password baru" />
              </div>
              <button onClick={handleChangePassword} disabled={saving}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                {saving ? '⏳ Menyimpan...' : '🔐 Ubah Password'}
              </button>
            </div>

            {/* Logout */}
            <div className={`${c.card} border rounded-3xl p-6`}>
              <h2 className={`font-bold ${c.text} mb-2`}>Sesi</h2>
              <p className={`text-sm ${c.sub} mb-4`}>Keluar dari akun SARS di perangkat ini</p>
              <button onClick={handleLogout}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  dark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'
                }`}>
                🚪 Keluar dari Akun
              </button>
            </div>

            {/* Danger Zone */}
            <div className={`border-2 rounded-3xl p-6 ${dark ? 'border-red-500/20 bg-red-500/5' : 'border-red-100 bg-red-50/50'}`}>
              <h2 className="font-bold text-red-500 mb-2">⚠️ Danger Zone</h2>
              <p className={`text-sm ${c.sub} mb-4`}>Tindakan ini tidak dapat dibatalkan</p>
              <button onClick={handleDeleteAccount}
                className="w-full py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition">
                🗑️ Hapus Akun Permanen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}