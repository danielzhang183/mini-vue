import { EMPTY_OBJ, ShapeFlags } from '@mini-vue/shared'
import type { VNode, VNodeArrayChildren } from './vnode'
import { Comment, Text, isSameVNodeType, normalizeVNode } from './vnode'

export interface Renderer<HostElement = RendererElement> {
  render: RootRenderFunction<HostElement>
}

export interface RendererNode {
  [key: string]: any
}

export interface RendererElement extends RendererNode { }

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement,
> {
  insert(el: HostElement, parent: HostElement, anchor?: HostNode | null): void
  remove(el: HostNode): void
  createElement(type: string): HostElement
  createText(text: string): HostNode
  createComment(text: string): HostNode
  setElementText(node: HostElement, text: string): void
  setText(node: HostNode, text: string): void
  patchProp(el: HostElement, key: string, prevValue: any, nextValue: any): void
  parentNode(node: HostNode): HostElement | null
  nextSibling(node: HostNode): HostNode | null
  querySelector?(selector: string): HostElement | null
}

type PatchFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
) => void

type UnmountFn = (
  vnode: VNode,
) => void

type ProcessTextOrCommentFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor?: RendererNode | null,
) => void

type PatchChildrenFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
) => void

type MountChildrenFn = (
  children: VNodeArrayChildren,
  container: RendererElement,
  anchor: RendererNode | null,
  start?: number
) => void

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode | null,
  container: HostElement,
) => void

export function createRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement,
>(options: RendererOptions<HostNode, HostElement>) {
  return baseCreateRenderer<HostNode, HostElement>(options)
}

// overload 1: no hydration
export function baseCreateRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement,
>(options: RendererOptions<HostNode, HostElement>): Renderer<HostNode>

export function baseCreateRenderer(options: RendererOptions): any {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment,
    patchProp: hostPatchProp,
    // parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = options

  const patch: PatchFn = (n1, n2, container, anchor) => {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }

    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor)
        break
      case Comment:
        processCommentNode(n1, n2, container, anchor)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT)
          processElement(n1, n2, container, anchor)
    }
  }

  const processText: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        (n2.el = hostCreateText(n2.children as string)),
        container,
        anchor,
      )
    }
    else {
      const el = (n2.el = n1.el!)
      if (n2.children !== n1.children)
        hostSetText(el, n2.children as string)
    }
  }

  const processCommentNode: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        (n2.el = hostCreateComment((n2.children as string) || '')),
        container,
        anchor,
      )
    }
    else {
      // there's no support for dynamic comments
      n2.el = n1.el
    }
  }

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
  ) => {
    if (n1 == null)
      mountElement(n2, container, anchor)
    else
      patchElement(n1, n2, anchor)
  }

  const mountElement = (vnode: VNode, container: RendererElement, anchor: RendererNode | null) => {
    const el = vnode.el = hostCreateElement(vnode.type as string)
    const { props, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children as string)
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(
        vnode.children as VNodeArrayChildren,
        el,
        anchor,
      )
    }

    // set props
    if (props) {
      for (const key in props)
        hostPatchProp(el, key, null, props[key])
    }

    hostInsert(el, container, anchor)
  }

  const mountChildren: MountChildrenFn = (children, container, anchor, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = normalizeVNode(children[i])
      patch(
        null,
        child,
        container,
        anchor,
      )
    }
  }

  const patchElement = (
    n1: VNode,
    n2: VNode,
    anchor: RendererNode | null,
  ) => {
    const el = (n2.el = n1.el!)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    // update props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key])
        hostPatchProp(el, key, oldProps[key], newProps[key])
    }
    for (const key in oldProps) {
      if (!(key in newProps))
        hostPatchProp(el, key, oldProps[key], null)
    }

    patchChildren(n1, n2, el, anchor)
  }

  // cover 9 situations
  const patchChildren: PatchChildrenFn = (
    n1,
    n2,
    container,
    anchor,
  ) => {
    const c1 = n1 && n1.children
    const prevShapeFlag = n1 ? n1.shapeFlag : 0
    const c2 = n2.children
    const { shapeFlag } = n2

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN)
        // @ts-expect-error vnode transformer
        c1.forEach(i => unmount(i))

      if (c2 !== c1)
        hostSetElementText(container, c2 as string)
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(
          c1 as VNode[],
          c2 as VNodeArrayChildren,
          container,
          anchor,
        )
      }
      else {
        hostSetElementText(container, '')
        // @ts-expect-error vnode transformer
        c2.forEach(i => patch(null, i, container))
      }
    }
    else {
      if (n1 == null)
        return
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN)
        // @ts-expect-error vnode transformer
        c1.forEach(i => unmount(i))
      else if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN)
        hostSetElementText(container, '')
    }
  }

  const patchKeyedChildren = (
    c1: VNode[],
    c2: VNodeArrayChildren,
    container: RendererElement,
    anchor: RendererNode | null,
  ) => {
    const l2 = c2.length
    const e1 = c1.length - 1
    const e2 = l2 - 1

    let lastIndex = 0
    for (let i = 0; i <= e2; i++) {
      console.log({ lastIndex })
      const n2 = c2[i] as VNode
      let j = 0
      let find = false

      for (j; j <= e1; j++) {
        const n1 = c1[j]

        if (isSameVNodeType(n1, n2)) {
          find = true
          // patch same vnode content
          patch(n1, n2, container, null)

          if (j < lastIndex) {
            // move
            const prevVNode = c2[i - 1] as VNode
            if (prevVNode) {
              const anchor = hostNextSibling(prevVNode)
              hostInsert(n2.el!, container, anchor)
            }
          }
          else {
            lastIndex = j
          }

          break
        }
      }

      // not find same vnode
      if (!find) {
        const prevVNode = c2[i - 1] as VNode
        const anchor = prevVNode
          ? hostNextSibling(prevVNode)
          : container.firstChild
        patch(null, n2, container, anchor)
      }
    }

    // umount old tree useless vnode
    for (let i = 0; i < e1; i++) {
      const n1 = c1[i]
      const has = c2.find(vnode => isSameVNodeType(vnode as VNode, n1))
      if (!has)
        unmount(n1)
    }
  }

  const unmount: UnmountFn = (vnode) => {
    hostRemove(vnode)
  }

  const render: RootRenderFunction = (vnode, container) => {
    if (vnode) {
      patch(container?._vnode || null, vnode, container, null)
    }
    else {
      if (container._vnode)
        unmount(container._vnode)
    }
    container._vnode = vnode
  }

  return {
    render,
  }
}
