import { initialsOf, paletteAt, paletteFor } from '../lib/avatar'

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
}

export default function Avatar({
  name,
  index,
  size = 'sm',
  ring = false,
}: {
  name: string
  /** Position within the group; keeps everyone's colour distinct. */
  index?: number
  size?: keyof typeof SIZES
  ring?: boolean
}) {
  const palette = index === undefined ? paletteFor(name) : paletteAt(index)
  return (
    <span
      aria-hidden="true"
      title={name}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight ${
        SIZES[size]
      } ${palette} ${
        ring ? 'ring-2 ring-stone-50 dark:ring-stone-950' : ''
      }`}
    >
      {initialsOf(name)}
    </span>
  )
}
