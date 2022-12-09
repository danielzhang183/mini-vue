import type { VNode } from './vnode'

export type Slot = (...args: any[]) => VNode[]

export interface InternalSlots {
  [name: string]: Slot | undefined
}

export type Slots = Readonly<InternalSlots>
