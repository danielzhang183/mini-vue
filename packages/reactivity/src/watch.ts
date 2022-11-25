import { effect } from './effect'
import { isDef, isObject } from './utils'

export function watch(source: any, cb: Function) {
  effect(
    () => traverse(source),
    {
      scheduler() {
        cb()
      },
    },
  )
}

export function traverse(value: any, seen = new Set()) {
  if (!isObject(value) || !isDef(value) || seen.has(value))
    return

  seen.add(value)
  for (const key in value)
    traverse(value[key], seen)

  return value
}
