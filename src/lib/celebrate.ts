/**
 * A short confetti burst, drawn on a throwaway canvas so it never enters
 * React's tree or blocks a tap. Returns a cancel function.
 *
 * Does nothing when the viewer asks for reduced motion - a celebration
 * isn't worth making someone queasy.
 */

const COLORS = ['#0fae86', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#a78bfa']

let running = false

export function burstConfetti(durationMs = 1800): (() => void) | undefined {
  if (typeof window === 'undefined' || running) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50'

  const width = window.innerWidth
  const height = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  ctx.scale(dpr, dpr)
  document.body.appendChild(canvas)
  running = true

  type Piece = {
    x: number
    y: number
    vx: number
    vy: number
    rot: number
    vr: number
    size: number
    color: string
  }

  const pieces: Piece[] = []
  // Two bursts angled inward, so the middle of the screen stays readable.
  for (const origin of [
    { x: width * 0.18, y: height * 0.6, bias: 0.4 },
    { x: width * 0.82, y: height * 0.6, bias: -0.4 },
  ]) {
    for (let i = 0; i < 44; i += 1) {
      const angle = -Math.PI / 2 + origin.bias + (Math.random() - 0.5) * 0.9
      const speed = 7 + Math.random() * 7
      pieces.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        size: 6 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }
  }

  const start = performance.now()
  let frame = 0

  function tick(now: number) {
    const elapsed = now - start
    const progress = elapsed / durationMs
    if (progress >= 1) {
      stop()
      return
    }

    // Non-null: ctx is checked before the canvas is ever mounted.
    const c = ctx as CanvasRenderingContext2D
    c.clearRect(0, 0, width, height)
    const alpha = progress > 0.65 ? 1 - (progress - 0.65) / 0.35 : 1

    for (const p of pieces) {
      p.vy += 0.28
      p.vx *= 0.995
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr

      c.save()
      c.translate(p.x, p.y)
      c.rotate(p.rot)
      c.globalAlpha = alpha
      c.fillStyle = p.color
      c.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7)
      c.restore()
    }

    frame = requestAnimationFrame(tick)
  }

  function stop() {
    if (!running) return
    running = false
    cancelAnimationFrame(frame)
    canvas.remove()
  }

  frame = requestAnimationFrame(tick)
  return stop
}

/**
 * Whether this device has already celebrated this group being settled, so a
 * refresh doesn't replay the confetti. Cleared when the group falls back out
 * of balance, so the next finish celebrates again.
 */
const key = (groupId: string) => `splitsmart:settled:${groupId}`

export function hasCelebrated(groupId: string): boolean {
  try {
    return localStorage.getItem(key(groupId)) === '1'
  } catch {
    return false
  }
}

export function markCelebrated(groupId: string): void {
  try {
    localStorage.setItem(key(groupId), '1')
  } catch {
    // Not remembering just means it may celebrate again; harmless.
  }
}

export function clearCelebrated(groupId: string): void {
  try {
    localStorage.removeItem(key(groupId))
  } catch {
    // As above.
  }
}
