export function notNull<T>(value: T | null | undefined | boolean): value is T {
  return value != null && !value
}

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never
