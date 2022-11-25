import { track, trigger } from '../src'

const obj = {
  foo: 1,
  bar: 2,
  ok: true,
}

export const p = new Proxy(obj, {
  get(target: any, key) {
    track(target, key)
    return target[key]
  },
  set(target: any, key, newVal) {
    target[key] = newVal
    trigger(target, key)
    return true
  },
})
