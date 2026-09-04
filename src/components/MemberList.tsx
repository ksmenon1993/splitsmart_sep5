import type { Member } from '../lib/supabase'
import Avatar from './Avatar'

export default function MemberList({
  members,
  meId,
}: {
  members: Member[]
  meId?: string | null
}) {
  if (members.length === 0) return null
  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
      {members.map((member, index) => (
        <li key={member.id} className="flex items-center gap-3 px-4 py-3">
          <Avatar name={member.name} index={index} size="md" />
          <span className="min-w-0 truncate font-medium">{member.name}</span>
          {member.id === meId && (
            <span className="ml-auto shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              you
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
