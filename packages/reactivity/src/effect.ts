import { extend, isArray, isIntegerKey } from '@mini-vue/shared'
import type { Dep } from './dep'
import { createDep } from './dep'
import type { EffectScope } from './effectScope'
import { recordEffectScope } from './effectScope'
import { TriggerOpTypes } from './operations'

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()
let activeEffect: ReactiveEffect | undefined
export const ITERATE_KEY = Symbol('iterate')

export type EffectScheduler = (...args: any[]) => any

export class ReactiveEffect<T = any> {
  active = true
  deps: Dep[] = []
  parent: ReactiveEffect | undefined = undefined

  /**
   * @internal
   */
  allowRecurse?: boolean
  /**
    * @internal
    */
  private deferStop?: boolean

  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null,
    scope?: EffectScope,
  ) {
    recordEffectScope(this, scope)
  }

  run() {
    if (!this.active)
      return this.fn()

    let parent: ReactiveEffect | undefined = activeEffect
    const lastShouldTrack = shouldTrack
    while (parent) {
      if (parent === this)
        return

      parent = parent.parent
    }
    try {
      this.parent = activeEffect
      activeEffect = this
      shouldTrack = true
      cleanupEffect(this)
      return this.fn()
    }
    finally {
      activeEffect = this.parent
      shouldTrack = lastShouldTrack
      this.parent = undefined

      if (this.deferStop)
        this.stop()
    }
  }

  stop() {

  }
}

export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
  scope?: EffectScope
  allowRecurse?: boolean
  onStop?: () => void
}

export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}

export function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions,
): ReactiveEffectRunner {
  const _effect = new ReactiveEffect(fn)
  if (options) {
    extend(_effect, options)
    if (options.scope)
      recordEffectScope(_effect, options.scope)
  }

  if (!options || !options.lazy)
    _effect.run()

  const runner = _effect.run.bind(effect) as ReactiveEffectRunner
  runner.effect = _effect

  return runner
}

export function cleanupEffect(effect: ReactiveEffect) {
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

export function track(target: object, key: unknown) {
  if (!activeEffect || !shouldTrack)
    return

  let depsMap = targetMap.get(target)
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep)
    depsMap.set(key, (dep = createDep()))

  trackEffects(dep)
}

export function trackEffects(dep: Dep) {
  const shouldTrack = !dep.has(activeEffect!)

  if (shouldTrack) {
    dep.add(activeEffect!)
    activeEffect?.deps.push(dep)
  }
}

export function trigger(
  target: any,
  key: unknown,
  type: TriggerOpTypes,
  newValue?: unknown,
) {
  const depsMap = targetMap.get(target)
  if (!depsMap)
    return

  let deps: (Dep | undefined)[] = []
  if (type === TriggerOpTypes.CLEAR) {
    deps = [...depsMap.values()]
  }
  else if (key === 'length' && isArray(target)) {
    const newLength = Number(newValue)
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= newLength)
        deps.push(dep)
    })
  }
  else {
    if (key !== undefined)
      deps.push(depsMap.get(key))

    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target))
          deps.push(depsMap.get(ITERATE_KEY))
        else if (isIntegerKey(key))
          deps.push(depsMap.get('length'))

        break
      case TriggerOpTypes.DELETE:
        break
      case TriggerOpTypes.SET:
        break
    }
  }

  if (deps[0]) {
    triggerEffects(deps[0])
  }
  else {
    const effects: ReactiveEffect[] = []
    for (const dep of deps) {
      if (dep)
        effects.push(...dep)
    }
    triggerEffects(createDep(effects))
  }
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  // spread into array for stabilization
  const effects = isArray(dep) ? dep : [...dep]
  for (const effect of effects) {
    if (effect.computed)
      triggerEffect(effect)
  }
  for (const effect of effects) {
    if (!effect.computed)
      triggerEffect(effect)
  }
}

function triggerEffect(
  effect: ReactiveEffect,
) {
  if (effect !== activeEffect || effect.allowRecurse) {
    if (effect.scheduler)
      effect.scheduler()
    else
      effect.run()
  }
}
