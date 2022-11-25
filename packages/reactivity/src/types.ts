export interface EffectOptions {
  scheduler?: (...args: any[]) => any
  lazy?: boolean
}

export interface Effect {
  (): void
  deps: Deps[]
  options: EffectOptions
}

export type DepKey = string | symbol
export type DepsMap = Map<DepKey, Deps>
export type Deps = Set<Effect>
