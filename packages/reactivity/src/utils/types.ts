import type { Target } from '../reactive'
import { ReactiveFlags } from '../reactive'

export function notNull<T>(value: T | null | undefined | boolean): value is T {
  return value != null && !value
}

export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}
