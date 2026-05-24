'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Tugas, Jadwal, StatusTugas, Prioritas } from '@/lib/types'

export default function TugasPage() {
  const [tugas, setTugas] = useState<Tugas[]>([])
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<Tugas | null>(null)
  const [filterStatus, setFilterStatus] = useState<StatusTugas | 'semua'>('semua')
  const [form, setForm] = useState({
    judul: '', deskripsi: '', deadline: '',
    jadwal_id: '', status: 'belum' as StatusTugas,
    prioritas: 'normal' as Prioritas,
    reminder_h2: true, reminder_hari_h: true
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      fetchData()
    }
    checkUser()
  }, [])

  const fetchData = async () => {
    const [{ data: tugasData }, { data: jadwalData }] = await Promise.all([
      supabase.from('tugas').select('*, jadwal(*)').order('deadline'),
      supabase.from('jadwal').select('*').order('mata_pelajaran')
    ])
    setTugas(tugasData || [])
    setJadwalList(jadwalData || [])
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.judul || !form.deadline) {
      alert('Judul dan deadline wajib diisi!')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      ...form,
      jadwal_id: form.jadwal_id || null,
      user_id: user.id
    }

    if (editData) {
      await supabase.from('tugas').update(payload).eq('id', editData.id)
    } else {
      await supabase.from('tugas').insert(payload)
    }
    resetForm()
    fetchData()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditData(null)
    setForm({
      judul: '', deskripsi: '', deadline: '',
      jadwal_id: '', status: 'belum', prioritas: 'normal',
      reminder_h2: true, reminder_hari_h: true
    })
  }

  const handleEdit = (t: Tugas) => {
    setEditData(t)
    setForm({
      judul: t.judul, deskripsi: t.deskripsi || '',
      deadline: t.deadline, jadwal_id: t.jadwal_id || '',
      status: t.status, prioritas: t.prioritas,
      reminder_h2: t.reminder_h2, reminder_hari_h: t.reminder_hari_h
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus tugas ini?')) return
    await supabase.from('tugas').delete().eq('id', id)
    fetchData()
  }

  const handleStatusChange = async (id: string, status: StatusTugas) => {
    await supabase.from('tugas').update({ status }).eq('id', id)
    fetchData()
  }

  const tugasFiltered = filterStatus === 'semua'
    ? tugas : tugas.filter(t => t.status === filterStatus)

  const prioritasColor = (p: Prioritas) => ({
    tinggi: 'bg-red-100 text-red-600',
    normal: 'bg-amber-100 text-amber-600',
    rendah: 'bg-green-100 text-green-600'
  }[p])

  const statusColor = (s: StatusTugas) => ({
    belum: 'bg-gray-100 text-gray-600',
    proses: 'bg-blue-100 text-blue-600',
    selesai: 'bg-green-100 text-green-600'
  }[s])

  const isDeadlineDekat = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime()
    return diff <= 2 * 24 * 60 * 60 * 1000 && diff > 0
  }

  const isDeadlineLewat = (deadline: string) => {
    return new Date(deadline).getTime() < new Date().getTime()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Memuat tugas...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-indigo-200 hover:text-white">← Dashboard</button>
          <h1 className="text-xl font-bold">Manajemen Tugas</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditData(null) }}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition text-sm">
          + Tambah Tugas
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Filter Status */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['semua', 'belum', 'proses', 'selesai'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'
              }`}>
              {s === 'semua' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {tugasFiltered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-500">Belum ada tugas</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
              + Tambah Tugas
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tugasFiltered.map(t => (
              <div key={t.id} className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition ${
                isDeadlineLewat(t.deadline) && t.status !== 'selesai' ? 'border-red-200' :
                isDeadlineDekat(t.deadline) && t.status !== 'selesai' ? 'border-amber-200' : 'border-gray-100'
              }`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={t.status === 'selesai'}
                    onChange={() => handleStatusChange(t.id, t.status === 'selesai' ? 'belum' : 'selesai')}
                    className="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`font-bold ${t.status === 'selesai' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {t.judul}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${prioritasColor(t.prioritas)}`}>
                        {t.prioritas}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>
                        {t.status}
                      </span>
                      {isDeadlineLewat(t.deadline) && t.status !== 'selesai' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Terlambat!</span>
                      )}
                      {isDeadlineDekat(t.deadline) && t.status !== 'selesai' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">Deadline dekat!</span>
                      )}
                    </div>
                    {t.deskripsi && <p className="text-sm text-gray-500 mb-1">{t.deskripsi}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>📅 Deadline: {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      {t.jadwal && <span>📚 {(t.jadwal as unknown as Jadwal).mata_pelajaran}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select value={t.status}
                      onChange={e => handleStatusChange(t.id, e.target.value as StatusTugas)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                      <option value="belum">Belum</option>
                      <option value="proses">Proses</option>
                      <option value="selesai">Selesai</option>
                    </select>
                    <button onClick={() => handleEdit(t)}
                      className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t.id)}
                      className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editData ? 'Edit Tugas' : 'Tambah Tugas'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Judul Tugas</label>
                <input value={form.judul}
                  onChange={e => setForm({ ...form, judul: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="contoh: Tugas Matematika Bab 3" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Deskripsi (opsional)</label>
                <textarea value={form.deskripsi}
                  onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  rows={3} placeholder="Deskripsi tugas..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Deadline</label>
                <input type="date" value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mata Pelajaran (opsional)</label>
                <select value={form.jadwal_id}
                  onChange={e => setForm({ ...form, jadwal_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {jadwalList.map(j => (
                    <option key={j.id} value={j.id}>{j.mata_pelajaran} ({j.hari})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Prioritas</label>
                  <select value={form.prioritas}
                    onChange={e => setForm({ ...form, prioritas: e.target.value as Prioritas })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="rendah">Rendah</option>
                    <option value="normal">Normal</option>
                    <option value="tinggi">Tinggi</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as StatusTugas })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="belum">Belum</option>
                    <option value="proses">Proses</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Reminder</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.reminder_h2}
                    onChange={e => setForm({ ...form, reminder_h2: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600" />
                  <span className="text-sm text-gray-600">Ingatkan 2 hari sebelum deadline</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.reminder_hari_h}
                    onChange={e => setForm({ ...form, reminder_hari_h: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600" />
                  <span className="text-sm text-gray-600">Ingatkan di hari deadline</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={resetForm}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                {editData ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}