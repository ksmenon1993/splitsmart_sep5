/**
 * Which member the person on this device is, remembered per group.
 *
 * There's no auth in the app, so "I paid" has to be answered locally. This
 * lives only in the viewer's browser: it never reaches Supabase, and two
 * people opening the same share link each keep their own answer.
 */

const key = (groupId: string) => `splitsmart:me:${groupId}`

export function readMe(groupId: string): string | null {
  try {
    return localStorage.getItem(key(groupId))
  } catch {
    // Private mode and blocked-storage settings both throw on access.
    return null
  }
}

export function writeMe(groupId: string, memberId: string): void {
  try {
    localStorage.setItem(key(groupId), memberId)
  } catch {
    // Not being able to remember is survivable; the default still applies.
  }
}
