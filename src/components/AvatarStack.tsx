import type { Member } from '../lib/supabase'
import Avatar from './Avatar'

const MAX_SHOWN = 6

/** Overlapping faces plus a plain-language count. */
export default function AvatarStack({ members }: { members: Member[] }) {
  const shown = members.slice(0, MAX_SHOWN)
  const extra = members.length - shown.length

  if (members.length === 0) {
    return (
      <p className="text-sm text-stone-500">No one in this group yet</p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex -space-x-2.5">
        {shown.map((member, index) => (
          <Avatar
            key={member.id}
            name={member.name}
            index={index}
            size="md"
            ring
          />
        ))}
        {extra > 0 && (
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-semibold text-stone-600 ring-2 ring-stone-50 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-950"
          >
            +{extra}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
        {members.length} {members.length === 1 ? 'person' : 'people'} in this
        group
      </p>
    </div>
  )
}
