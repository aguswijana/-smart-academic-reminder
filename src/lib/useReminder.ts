import { useEffect } from 'react'
import { requestNotificationPermission, runReminderCheck } from '@/lib/reminder'

export function useReminder(userId: string | null) {
  useEffect(() => {
    if (!userId) return

    // Minta izin notifikasi browser
    requestNotificationPermission()

    // Jalankan pengecekan pertama kali saat halaman dibuka
    runReminderCheck(userId)

    // Jalankan setiap 1 menit
    const interval = setInterval(() => {
      runReminderCheck(userId)
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [userId])
}