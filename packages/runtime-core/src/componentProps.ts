import type { ConcreteComponent, Data } from './component'

export type Prop<T, D = T> = PropOptions<T, D> | PropType<T>

type DefaultFactory<T> = (props: Data) => T | null | undefined

export interface PropOptions<T = any, D = T> {
  type?: PropType<T> | true | null
  required?: boolean
  default?: D | DefaultFactory<D> | null | undefined | object
  validator?(value: unknown): boolean
}

export type PropType<T> = PropConstructor<T> | PropConstructor<T>[]

type PropConstructor<T = any> =
  | { new (...args: any[]): T & {} }
  | { (): T }
  | PropMethod<T>

type PropMethod<T, TConstructor = any> = [T] extends [
  ((...args: any) => any) | undefined,
] // if is function with args, allowing non-required functions
  ? { new (): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never

export type ComponentPropsOptions<P = Data> =
  | ComponentObjectPropsOptions<P>
  | string[]

export type ComponentObjectPropsOptions<P = Data> = {
  [K in keyof P]: Prop<P[K]> | null
}

export function normalizePropsOptions(
  comp: ConcreteComponent,
  appContext: AppContext,
  asMixin = false,
): NormalizedPropsOptions {

}

export function initProps(
  instance: ComponentInternalInstance,
  rawProps: Data | null,
  isStateful: number,
) {
  const props: Data = {}
}

export function resolveProps(options, propsData) {
  const props = {}
  const attrs = {}
  for (const key in propsData) {
    if (key in options)
      props[key] = propsData[key]
    else
      attrs[key] = propsData[key]
  }

  return [props, attrs]
}

export function hasPropsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps)
  if (nextKeys.length !== Object.keys(prevProps).length)
    return true

  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    if (nextProps[key] !== prevProps[key])
      return true
  }

  return false
}
