import { createClient } from '@/lib/supabase'
import { playAlarm } from '@/lib/alarm'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

function sendBrowserNotif(title: string, body: string) {
  if (Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: '/favicon.ico',
  })
}

async function saveNotif(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  tipe: string,
  pesan: string,
  tugasId?: string
) {
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('tipe', tipe)
    .eq('pesan', pesan)
    .gte('created_at', `${today}T00:00:00`)
    .maybeSingle()
  if (existing) return
  await supabase.from('notifications').insert({
    user_id: userId,
    tugas_id: tugasId || null,
    tipe,
    pesan,
    is_read: false,
  })
}

async function cekJadwalHarian(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const hariIni = hariIndo[new Date().getDay()]
  const jamSekarang = new Date().toTimeString().substring(0, 5)
  const [hNow, mNow] = jamSekarang.split(':').map(Number)
  const nowMenit = hNow * 60 + mNow

  const { data: jadwal } = await supabase
    .from('jadwal')
    .select('*')
    .eq('user_id', userId)
    .eq('hari', hariIni)

  if (!jadwal) return

  for (const j of jadwal) {
    const jamMulai = j.jam_mulai.substring(0, 5)
    const jamSelesai = j.jam_selesai.substring(0, 5)
    const [h, m] = jamMulai.split(':').map(Number)
    const mulaiMenit = h * 60 + m
    const selisih = mulaiMenit - nowMenit

    if (selisih >= 0 && selisih <= 5) {
      const pesan = `📚 ${j.mata_pelajaran} dimulai pukul ${jamMulai}${j.ruangan ? ` di ${j.ruangan}` : ''}`
      sendBrowserNotif('⏰ Jadwal Pelajaran', pesan)
      await saveNotif(supabase, userId, 'jadwal_harian', pesan)
    }

    if (jamSekarang >= jamMulai && jamSekarang <= jamSelesai) {
      const pesan = `🕐 Sedang berlangsung: ${j.mata_pelajaran} (${jamMulai} - ${jamSelesai})`
      await saveNotif(supabase, userId, 'tugas_aktif', pesan)
    }
  }
}

async function cekDeadlineTugas(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const { data: tugas } = await supabase
    .from('tugas')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'selesai')

  if (!tugas) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const t of tugas) {
    const deadline = new Date(t.deadline)
    deadline.setHours(0, 0, 0, 0)
    const selisihHari = Math.round((deadline.getTime() - today.getTime()) / 86400000)

    if (selisihHari === 2 && t.reminder_h2) {
      const pesan = `⚠️ Tugas "${t.judul}" deadline 2 hari lagi!`
      sendBrowserNotif('Deadline H-2', pesan)
      await saveNotif(supabase, userId, 'deadline_h2', pesan, t.id)
    }

    if (selisihHari === 0 && t.reminder_hari_h) {
      const pesan = `🔥 Tugas "${t.judul}" deadline HARI INI!`
      playAlarm()
      sendBrowserNotif('🔥 Deadline Hari Ini!', pesan)
      await saveNotif(supabase, userId, 'deadline_hari_h', pesan, t.id)
    }

    if (selisihHari < 0) {
      const pesan = `❌ Tugas "${t.judul}" melewati deadline ${Math.abs(selisihHari)} hari lalu!`
      await saveNotif(supabase, userId, 'deadline_hari_h', pesan, t.id)
    }
  }
}

export async function runReminderCheck(userId: string) {
  const supabase = createClient()
  await Promise.all([
    cekJadwalHarian(supabase, userId),
    cekDeadlineTugas(supabase, userId),
  ])
}