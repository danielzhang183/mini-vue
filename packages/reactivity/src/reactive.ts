import { ITERATE_KEY, track, trigger } from './effect'
import { TriggerOpTypes } from './operations'
import { hasChanged, hasOwnProperty, isArray, isObject } from './utils'

export function reactive(obj: object) {
  return createReactive(obj)
}

export function shallowReactive(obj: object) {
  return createReactive(obj, true)
}

export function readonly(obj: object) {
  return createReactive(obj, false, true)
}

export function shallowReadonly(obj: object) {
  return createReactive(obj, true, true)
}

export function createReactive(obj: object, isShallow = false, isReadonly = false): any {
  return new Proxy(obj, {
    get(target: any, key, receiver) {
      if (key === 'raw')
        return target

      const res = Reflect.get(target, key, receiver)

      if (!isReadonly)
        track(target, key)

      if (isShallow)
        return res

      if (isObject(res))
        return isReadonly ? readonly(res) : reactive(res)

      return res
    },
    set(target: any, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`Property ${key.toString()} isReadonly`)
        return true
      }

      const oldVal = target[key]
      const type = isArray(target)
        ? Number(key) < target.length ? TriggerOpTypes.SET : TriggerOpTypes.ADD
        : hasOwnProperty(target, key) ? TriggerOpTypes.SET : TriggerOpTypes.ADD
      const res = Reflect.set(target, key, newVal, receiver)
      if (target === receiver.raw && hasChanged(oldVal, newVal))
        trigger(target, key, type, newVal)

      return res
    },
    apply(target, thisArg, argArray) {
      target.call(thisArg, ...argArray)
    },
    defineProperty(target, key, receiver) {
      if (isReadonly) {
        console.warn(`Property ${key.toString()} isReadonly`)
        return true
      }

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
}
