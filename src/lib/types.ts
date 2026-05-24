export type Hari = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu'

export type StatusTugas = 'belum' | 'proses' | 'selesai'

export type Prioritas = 'rendah' | 'normal' | 'tinggi'

export type Jadwal = {
  id: string
  user_id: string
  mata_pelajaran: string
  hari: Hari
  jam_mulai: string
  jam_selesai: string
  ruangan?: string
  warna: string
  created_at?: string
}

export type Tugas = {
  id: string
  user_id: string
  jadwal_id?: string
  jadwal?: Jadwal
  judul: string
  deskripsi?: string
  deadline: string
  status: StatusTugas
  prioritas: Prioritas
  reminder_h2: boolean
  reminder_hari_h: boolean
  created_at?: string
}

export type Notifikasi = {
  id: string
  user_id: string
  tugas_id?: string
  pesan: string
  dibaca: boolean
  created_at?: string
}