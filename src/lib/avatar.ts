/**
 * Every colour pair is written out in full because Tailwind extracts class
 * names statically - a built-up string like `bg-${c}-100` would never ship.
 */
const PALETTE = [
  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-200',
  'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200',
  'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200',
]

/**
 * Colour by position in the group. Hashing the name instead looked tempting
 * but collides badly at small sizes - Ana and Tom landed on the same colour
 * in a four-person group - which defeats the point of colouring at all.
 * Members are ordered by created_at and only ever appended, so an existing
 * member's index (and colour) doesn't move when someone new joins.
 */
export function paletteAt(index: number): string {
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length]
}

/** Fallback for a name with no known position, e.g. a deleted member. */
export function paletteFor(name: string): string {
  let hash = 5381
  for (let i = 0; i < name.length; i += 1) {
    hash = ((hash << 5) + hash + name.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  // Array.from so accented letters and emoji survive being sliced.
  const first = Array.from(parts[0])[0] ?? '?'
  if (parts.length === 1) return first.toUpperCase()
  const last = Array.from(parts[parts.length - 1])[0] ?? ''
  return (first + last).toUpperCase()
}

export const PALETTE_SIZE = PALETTE.length
