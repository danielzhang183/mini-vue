import { effect } from './effect'
import { isDef, isFunction, isObject } from './utils'

export enum FlushOps {
  PRE = 'pre',
  SYNC = 'sync',
  POST = 'post',
}

export type WatchGetter = Function | object | undefined
export interface WatchOptions {
  immediate?: boolean
  flush?: FlushOps
}
export type WatchCallback = (newVal: any, oldVal: any, onInvalidate: Function) => void

const defaultOptions: WatchOptions = {
  immediate: false,
  flush: FlushOps.SYNC,
}

export function watch(
  source: WatchGetter,
  callback: WatchCallback,
  options?: WatchOptions,
) {
  let getter: Function
  if (isFunction(source))
    getter = source
  else
    getter = () => traverse(source)

  options = Object.assign(defaultOptions, options || {})

  let oldVal: any, newVal

  let cleanup: Function | undefined

  function onInvalidate(fn: Function) {
    cleanup = fn
  }
  const job = () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    newVal = effectFn()
    if (cleanup)
      cleanup()

    callback(newVal, oldVal, onInvalidate)
    oldVal = newVal
  }

  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        if (options?.flush === FlushOps.POST) {
          const p = Promise.resolve()
          p.then(job)
        }
        else {
          job()
        }
      },
    },
  )

  if (options.immediate)
    job()
  else
    oldVal = effectFn()
}

export function traverse(value: any, seen = new Set()) {
  if (!isObject(value) || !isDef(value) || seen.has(value))
    return

  seen.add(value)
  for (const key in value)
    traverse(value[key], seen)

  return value
}
