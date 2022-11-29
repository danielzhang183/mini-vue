export function notNull<T>(value: T | null | undefined | boolean): value is T {
  return value != null && !value
}
