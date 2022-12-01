import { ShapeFlags, isArray, isBoolean, isFunction, isObject, isString } from '@mini-vue/shared'
import type { RendererElement, RendererNode } from './renderer'

export type Data = Record<string, unknown>

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

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren

export type VNodeNormalizedChildren =
  | string
  | VNodeArrayChildren
  // | RawSlots
  | null

export interface VNode<
  HostNode = RendererNode,
  HostElement = RendererElement,
  ExtraProps = { [key: string]: any },
> {
  /**
   * @internal
   */
  __v_isVNode: true

  type: VNodeTypes
  props: (VNodeProps & ExtraProps) | null
  // key: string | number | symbol | null
  children: VNodeNormalizedChildren

  // DOM
  el: HostNode | null
  anchor: HostNode | null // fragment anchor
  target: HostElement | null // teleport target
  targetAnchor: HostNode | null // teleport target anchor

  // optimization only
  shapeFlag: number
  patchFlag: number
}

export const isVNode = (val: any): val is VNode => val?.__v_isVNode === true

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

/**
 * @private
 */
export function createTextVNode(text = ' ', flag = 0): VNode {
  return createVNode(Text, null, text, flag)
}

/**
 * @private
 */
export function createCommentVNode(text = ''): VNode {
  return createVNode(Comment, null, text)
}

export function createVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false,
): VNode {
  // TODO: class & style normalization

  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    // : isSuspense(type)
    //   ? ShapeFlags.SUSPENSE
    //   : isTeleport(type)
    //     ? ShapeFlags.TELEPORT
    : isObject(type)
      ? ShapeFlags.STATEFUL_COMPONENT
      : isFunction(type)
        ? ShapeFlags.FUNCTIONAL_COMPONENT
        : 0

  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true,
  )
}

export { createBaseVNode as createElementVNode }

function createBaseVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT,
  isBlockNode = false,
  needFullChildrenNormalization = false,
) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    // key: props && normalizeKey(props),
    // ref: props && normalizeRef(props),
    // scopeId: currentScopeId,
    // slotScopeIds: null,
    children,
    // component: null,
    // suspense: null,
    // ssContent: null,
    // ssFallback: null,
    // dirs: null,
    // transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    // staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    // dynamicChildren: null,
    // appContext: null,
  } as VNode

  if (needFullChildrenNormalization)
    normalizeChildren(vnode, children)

  if (isBlockNode) {
    // TODO: optimization only, for now useless
  }

  return vnode
}

function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0
  const { shapeFlag } = vnode

  if (children == null) {
    children = null
  }
  else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  }
  else if (isObject(children)) {
    // TODO: handle slot logics when i need
  }
  else if (isFunction(children)) {
    children = { default: children }
    type = ShapeFlags.SLOTS_CHILDREN
  }
  else {
    children = String(children)
    if (shapeFlag & ShapeFlags.TELEPORT) {
      type = ShapeFlags.ARRAY_CHILDREN
      children = [createTextVNode(children as string)]
    }
    else {
      type = ShapeFlags.TEXT_CHILDREN
    }
  }

  vnode.children = children as VNodeArrayChildren
  vnode.shapeFlag |= type
}

export function normalizeVNode(child: VNodeChild): VNode {
  if (child == null || isBoolean(child)) {
    return createVNode(Comment)
  }
  else if (isArray(child)) {
    return createVNode(Fragment, null, child.slice())
  }
  else if (isObject(child)) {
    // already vnode, this should be the most common since compiled templates
    // always produce all-vnode children array
    // TODO: handle
    return child
  }
  else {
    return createVNode(Text, null, String(child))
  }
}
