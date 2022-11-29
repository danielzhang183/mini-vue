import { isArray, notNull } from '@mini-vue/shared'
import { TriggerOpTypes } from './operations'
import type { DepKey, Deps, DepsMap, Effect, EffectOptions } from './types'

const targetMap: WeakMap<Object, DepsMap> = new WeakMap()
let activeEffect: Effect | undefined
const effectStack: Effect[] = []
export const ITERATE_KEY = Symbol('iterate')

export function effect(fn: Function, options?: EffectOptions): Effect {
  const effectFn: Effect = () => {
    cleanupEffect(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }

  effectFn.options = options || {}
  effectFn.deps = []
  if (!options?.lazy)
    effectFn()

  return effectFn
}

export function cleanupEffect(effect: Effect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++)
      deps[i].delete(effect)
    deps.length = 0
  }
}

export let shouldTrack = true
const trackStack: boolean[] = []

export function pauseTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = false
}

export function enableTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = true
}

export function resetTracking() {
  const last = trackStack.pop()
  shouldTrack = last === undefined ? true : last
}

export function track(target: any, key: DepKey) {
  if (!activeEffect || !shouldTrack)
    return

  let depsMap = targetMap.get(target)
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps)
    depsMap.set(key, (deps = new Set()))

  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

export function trigger(target: any, key: DepKey, type: TriggerOpTypes, newVal?: any) {
  const depsMap = targetMap.get(target)
  if (!depsMap)
    return
  const effects = isArray(target) && key === 'length'
    ? Object.entries(depsMap)
      .map(([key, effects]: [string, Deps]): boolean | undefined | Deps => (key >= newVal) && effects)
      .filter(notNull)
      .flat() as any as Deps
    : depsMap.get(key)
  const effectsToRun: Deps = new Set()
  effects?.forEach((effect) => {
    if (effect !== activeEffect)
      effectsToRun.add(effect)
  })

  if ([TriggerOpTypes.ADD, TriggerOpTypes.DELETE].includes(type)) {
    const iterateEffects = depsMap.get(ITERATE_KEY)
    iterateEffects?.forEach((effect) => {
      if (effect !== activeEffect)
        effectsToRun.add(effect)
    })
  }

  if (isArray(target) && type === TriggerOpTypes.ADD) {
    const lengthEffects = depsMap.get('length')
    lengthEffects?.forEach((effect) => {
      if (effect !== activeEffect)
        effectsToRun.add(effect)
    })
  }

  effectsToRun.forEach((effect) => {
    if (effect.options.scheduler)
      effect.options.scheduler(effect)
    else
      effect()
  })
}
