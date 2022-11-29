// import type { RendererElement, RendererNode } from './renderer'

export interface VNodeProps {
  key?: string | number | symbol
  // ref?: VNodeRef
  ref_for?: boolean
  ref_key?: string

  // vnode hooks
  // onVnodeBeforeMount?: VNodeMountHook | VNodeMountHook[]
  // onVnodeMounted?: VNodeMountHook | VNodeMountHook[]
  // onVnodeBeforeUpdate?: VNodeUpdateHook | VNodeUpdateHook[]
  // onVnodeUpdated?: VNodeUpdateHook | VNodeUpdateHook[]
  // onVnodeBeforeUnmount?: VNodeMountHook | VNodeMountHook[]
  // onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[]
}

type VNodeChildAtom =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | void

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeNormalizedChildren =
  | string
  | VNodeArrayChildren
  // | RawSlots
  | null

export interface VNode {
  // <
  //   HostNode = RendererNode,
  //   HostElement = RendererElement,
  //   ExtraProps = { [key: string]: any },
  // > {
  /**
   * @internal
   */
  __v_isVNode: true

  type: VNodeTypes
  // props: (VNodeProps & ExtraProps) | null
  // key: string | number | symbol | null
  children: VNodeNormalizedChildren

  // DOM
  // el: HostNode | null
  // anchor: HostNode | null // fragment anchor
  // target: HostElement | null // teleport target
  // targetAnchor: HostNode | null // teleport target anchor
}

export const Fragment = Symbol('Fragment') as any as {
  __isFragment: true
  // new(): {
  //   $props: VNodeProps
  // }
}
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')
export const Static = Symbol('Static')

export type VNodeTypes =
  | string
  | VNode
  // | Component
  | typeof Text
  | typeof Static
  | typeof Comment
  | typeof Fragment
  // | typeof TeleportImpl
  // | typeof SuspenseImpl
