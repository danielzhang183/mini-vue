import { isArray, isObject } from '@mini-vue/shared'
import type { Fragment, VNode, VNodeArrayChildren, VNodeProps } from './vnode'
import { createVNode, isVNode } from './vnode'

type RawProps = VNodeProps & {
  __v_isVNode?: never
  [Symbol.iterator]?: never
} & Record<string, any>

type RawChildren =
  | string
  | number
  | boolean
  | VNode
  | VNodeArrayChildren
  | (() => any)

export function h(type: string, children?: RawChildren): VNode

export function h(
  type: string,
  props?: RawProps | null,
  children?: RawChildren
): VNode

// text/comment
export function h(
  type: typeof Text | typeof Comment,
  children?: string | number | boolean
): VNode
// fragment
export function h(type: typeof Fragment, children?: VNodeArrayChildren): VNode
export function h(
  type: typeof Fragment,
  props?: RawProps | null,
  children?: VNodeArrayChildren
): VNode

// implement
export function h(
  type: any,
  propsOrChildren?: any,
  children?: any,
): VNode {
  const l = arguments.length
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren))
        return createVNode(type, null, [propsOrChildren])

      return createVNode(type, propsOrChildren as RawProps)
    }
    else {
      return createVNode(type, null, propsOrChildren)
    }
  }
  else {
    if (l > 3)
      // eslint-disable-next-line prefer-rest-params
      children = Array.prototype.slice.call(arguments, 2)
    else if (l === 3 && isVNode(children))
      children = [children]

    return createVNode(type, propsOrChildren, children)
  }
}
