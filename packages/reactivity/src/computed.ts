import { effect, track, trigger } from './effect'

export function computed(getter: Function) {
  let value: any
  let dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      trigger(obj, 'value')
    },
  })

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    },
  }

  return obj
}
