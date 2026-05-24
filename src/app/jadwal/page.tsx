'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Jadwal, Hari } from '@/lib/types'

const HARI_LIST: Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const WARNA_LIST = [
  '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
]

export default function JadwalPage() {
  const [jadwal, setJadwal] = useState<Jadwal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<Jadwal | null>(null)
  const [selectedHari, setSelectedHari] = useState<Hari | 'Semua'>('Semua')

  const [form, setForm] = useState({
    mata_pelajaran: '',
    hari: 'Senin' as Hari,
    jam_mulai: '',
    jam_selesai: '',
    ruangan: '',
    warna: '#6366F1'
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      fetchJadwal()
    }
    checkUser()
  }, [])

  const fetchJadwal = async () => {
    const { data } = await supabase
      .from('jadwal')
      .select('*')
      .order('hari')
      .order('jam_mulai')
    setJadwal(data || [])
    setLoading(false)
  }

  const formatWaktu = (waktu: string) => {
    if (!waktu) return ''
    return waktu.substring(0, 5)
  }

  const handleSubmit = async () => {
    if (!form.mata_pelajaran || !form.jam_mulai || !form.jam_selesai) {
      alert('Mata pelajaran, jam mulai, dan jam selesai wajib diisi!')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      ...form,
      jam_mulai: formatWaktu(form.jam_mulai),
      jam_selesai: formatWaktu(form.jam_selesai)
    }

    if (editData) {
      await supabase.from('jadwal').update(payload).eq('id', editData.id)
    } else {
      await supabase.from('jadwal').insert({ ...payload, user_id: user.id })
    }

    setShowForm(false)
    setEditData(null)
    setForm({ mata_pelajaran: '', hari: 'Senin', jam_mulai: '', jam_selesai: '', ruangan: '', warna: '#6366F1' })
    fetchJadwal()
  }

  const handleEdit = (j: Jadwal) => {
    setEditData(j)
    setForm({
      mata_pelajaran: j.mata_pelajaran,
      hari: j.hari,
      jam_mulai: j.jam_mulai.substring(0, 5),
      jam_selesai: j.jam_selesai.substring(0, 5),
      ruangan: j.ruangan || '',
      warna: j.warna
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return
    await supabase.from('jadwal').delete().eq('id', id)
    fetchJadwal()
  }

  const jadwalFiltered = selectedHari === 'Semua'
    ? jadwal
    : jadwal.filter(j => j.hari === selectedHari)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6f7fb] to-[#efe7ff]">
      <div className="bg-white p-5 rounded-2xl shadow-lg">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Memuat jadwal...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f7fb] to-[#efe7ff]">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-indigo-500 hover:text-indigo-700 text-sm transition"
            >
              ← Dashboard
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-800">Jadwal Pelajaran</h1>
              <p className="text-xs text-gray-500">Smart Academic Reminder System</p>
            </div>
          </div>

          <button
            onClick={() => { setShowForm(true); setEditData(null) }}
            className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow hover:scale-105 transition-all duration-300"
          >
            + Tambah Jadwal
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 shadow border border-gray-100">
            <p className="text-xs text-gray-500">Total Jadwal</p>
            <h2 className="text-2xl font-bold text-indigo-600 mt-2">{jadwal.length}</h2>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow border border-gray-100">
            <p className="text-xs text-gray-500">Hari Dipilih</p>
            <h2 className="text-2xl font-bold text-blue-500 mt-2">{selectedHari}</h2>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow border border-gray-100">
            <p className="text-xs text-gray-500">Jadwal Aktif</p>
            <h2 className="text-2xl font-bold text-emerald-500 mt-2">{jadwalFiltered.length}</h2>
          </div>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['Semua', ...HARI_LIST] as const).map(h => (
            <button
              key={h}
              onClick={() => setSelectedHari(h)}
              className={selectedHari === h
                ? 'px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow transition-all duration-300'
                : 'px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-600 border border-gray-200 hover:border-indigo-400 hover:scale-105 transition-all duration-300'}
            >
              {h}
            </button>
          ))}
        </div>

        {/* EMPTY */}
        {jadwalFiltered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm text-gray-500">Belum ada jadwal</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-5 py-2 rounded-lg text-sm shadow hover:scale-105 transition-all"
            >
              + Tambah Jadwal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {jadwalFiltered.map(j => (
              <div
                key={j.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: j.warna }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-gray-800 truncate">{j.mata_pelajaran}</h3>
                    <span className="text-xs bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-2.5 py-0.5 rounded-full font-medium flex-shrink-0">
                      {j.hari}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    🕐 {formatWaktu(j.jam_mulai)} - {formatWaktu(j.jam_selesai)}
                  </p>
                  {j.ruangan && (
                    <p className="text-xs text-gray-500 mt-0.5">📍 {j.ruangan}</p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(j)}
                    className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:scale-105 transition-all shadow"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 hover:scale-105 transition-all shadow"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-2xl">

            <h2 className="text-base font-bold text-gray-800 mb-4">
              {editData ? 'Edit Jadwal' : 'Tambah Jadwal'}
            </h2>

            <div className="space-y-3">

              <div>
                <label className="text-xs font-semibold text-gray-700">Mata Pelajaran</label>
                <input
                  value={form.mata_pelajaran}
                  onChange={e => setForm({ ...form, mata_pelajaran: e.target.value })}
                  placeholder="Contoh: Matematika"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Hari</label>
                <select
                  value={form.hari}
                  onChange={e => setForm({ ...form, hari: e.target.value as Hari })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {HARI_LIST.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Jam Mulai</label>
                  <input
                    type="time"
                    value={form.jam_mulai}
                    onChange={e => setForm({ ...form, jam_mulai: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Jam Selesai</label>
                  <input
                    type="time"
                    value={form.jam_selesai}
                    onChange={e => setForm({ ...form, jam_selesai: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Ruangan</label>
                <input
                  value={form.ruangan}
                  onChange={e => setForm({ ...form, ruangan: e.target.value })}
                  placeholder="Contoh: Ruang 12A"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Warna</label>
                <div className="flex gap-2 mt-2">
                  {WARNA_LIST.map(w => (
                    <button
                      key={w}
                      onClick={() => setForm({ ...form, warna: w })}
                      className={form.warna === w
                        ? 'w-8 h-8 rounded-full ring-4 ring-offset-2 ring-gray-300 scale-110 transition-all duration-300'
                        : 'w-8 h-8 rounded-full transition-all duration-300'}
                      style={{ backgroundColor: w }}
                    />
                  ))}
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowForm(false); setEditData(null) }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-2 rounded-lg text-sm hover:scale-105 transition-all shadow"
              >
                {editData ? 'Simpan' : 'Tambah'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}