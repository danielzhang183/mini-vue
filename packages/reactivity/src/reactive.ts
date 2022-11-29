import { hasChanged, hasOwnProperty, isArray, isObject, isSymbol } from '@mini-vue/shared'
import { arrayInstrumentations } from './baseHandlers'
import { ITERATE_KEY, track, trigger } from './effect'
import { TriggerOpTypes } from './operations'

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw',
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}

const reactiveMap = new Map()

export function reactive(obj: object) {
  const existedProxy = reactiveMap.get(obj)
  if (existedProxy)
    return existedProxy

  const proxy = createReactive(obj)
  reactiveMap.set(obj, proxy)

  return proxy
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
      if (key === ReactiveFlags.RAW)
        return target

      if (isArray(target) && hasOwnProperty(arrayInstrumentations, key))
        return Reflect.get(arrayInstrumentations, key, receiver)

      if (!isReadonly && !isSymbol(key))
        track(target, key)

      const res = Reflect.get(target, key, receiver)

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
      track(target, isArray(target) ? 'length' : ITERATE_KEY)
      return Reflect.ownKeys(target)
    },
  })
}
