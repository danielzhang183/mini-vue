import { TriggerOpTypes } from './operations'
import type { DepKey, DepsMap, Effect, EffectOptions } from './types'

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

export function track(target: any, key: DepKey) {
  if (!activeEffect)
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

export function trigger(target: any, key: DepKey, type: TriggerOpTypes) {
  const depsMap = targetMap.get(target)
  if (!depsMap)
    return

  const effects = depsMap.get(key)
  if (!effects)
    return

  const effectsToRun: Set<Effect> = new Set()
  effects.forEach((effect) => {
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

  effectsToRun.forEach((effect) => {
    if (effect.options.scheduler)
      effect.options.scheduler(effect)
    else
      effect()
  })
}
