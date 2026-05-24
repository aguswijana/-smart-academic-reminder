export function playAlarm() {
  try {
    const ctx = new AudioContext()

    const beep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }

    beep(880, 0, 0.2)
    beep(880, 0.3, 0.2)
    beep(880, 0.6, 0.4)
    beep(1100, 1.0, 0.6)
  } catch (e) {
    console.log('Audio tidak tersedia:', e)
  }
}