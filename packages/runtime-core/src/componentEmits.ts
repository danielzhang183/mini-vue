import type { UnionToIntersection } from '@mini-vue/shared'
import type { AppContext } from './apiCreateApp'
import type { ConcreteComponent } from './component'

export type ObjectEmitsOptions = Record<
  string,
  ((...args: any[]) => any) | null
>

export type EmitsOptions = ObjectEmitsOptions | string[]

export type EmitFn<
  Options = ObjectEmitsOptions,
  Event extends keyof Options = keyof Options,
> = Options extends Array<infer V>
  ? (event: V, ...args: any[]) => void
  : {} extends Options // if the emit is empty object (usually the default value for emit) should be converted to function
      ? (event: string, ...args: any[]) => void
      : UnionToIntersection<
      {
        [key in Event]: Options[key] extends (...args: infer Args) => any
          ? (event: key, ...args: Args) => void
          : (event: key, ...args: any[]) => void
      }[Event]
    >

export function normalizeEmitsOptions(
  comp: ConcreteComponent,
  appContext: AppContext,
) {

}
