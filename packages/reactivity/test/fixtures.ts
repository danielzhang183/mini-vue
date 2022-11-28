import { track, trigger } from '../src'
import { TriggerOpTypes } from '../src/operations'
import { hasChanged, hasOwnProperty } from '../src/utils'

export const obj = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.bar
  },
  ok: true,
}

const ITERATE_KEY = Symbol('iterate')

export const p = new Proxy(obj, {
  get(target: any, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target: any, key, newVal, receiver) {
    const oldVal = target[key]
    const type = hasOwnProperty(target, key) ? TriggerOpTypes.SET : TriggerOpTypes.ADD
    const res = Reflect.set(target, key, newVal, receiver)
    if (hasChanged(oldVal, newVal))
      trigger(target, key, type)
    return res
  },
  apply(target, thisArg, argArray) {
    target.call(thisArg, ...argArray)
  },
  defineProperty(target, key, receiver) {
    const hadKey = hasOwnProperty(target, key)
    const res = Reflect.defineProperty(target, key, receiver)
    if (res && hadKey)
      trigger(target, key, TriggerOpTypes.DELETE)

    return res
  },
  has(target, key) {
    track(target, key)
    return Reflect.has(target, key)
  },
  ownKeys(target) {
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  },
})
