import { EMPTY_OBJ, ShapeFlags } from '@mini-vue/shared'
import type { VNode, VNodeArrayChildren } from './vnode'
import { Comment, Text, normalizeVNode } from './vnode'

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
}

type PatchFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor?: RendererNode | null,
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
  } = options

  const patch: PatchFn = (n1, n2, container) => {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }

    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      case Comment:
        processCommentNode(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT)
          processElement(n1, n2, container)
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
  ) => {
    if (n1 == null)
      mountElement(n2, container)
    else
      patchElement(n1, n2)
  }

  const mountElement = (vnode: VNode, container: RendererElement) => {
    const el = vnode.el = hostCreateElement(vnode.type as string)
    const { props, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children as string)
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(
        vnode.children as VNodeArrayChildren,
        el,
        null,
      )
    }

    // set props
    if (props) {
      for (const key in props)
        hostPatchProp(el, key, null, props[key])
    }

    hostInsert(el, container)
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

    patchChildren(n1, n2, el)
  }

  // cover 9 situations
  const patchChildren: PatchChildrenFn = (
    n1,
    n2,
    container,
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
        const c1Len = c1?.length || 0
        const c2Len = c2?.length || 0
        const commonLen = Math.min(c1Len, c2Len)
        for (let i = 0; i < commonLen; i++)
          // @ts-expect-error vnode transformer
          patch(c1[i], c2[i], container)

        if (c2Len > c1Len) {
          for (let i = commonLen; i < c2Len; i++)
            // @ts-expect-error vnode transformer
            patch(null, c2[i], container)
        }
        else if (c1Len > c2Len) {
          for (let i = commonLen; i < c1Len; i++)
            // @ts-expect-error vnode transformer
            unmount(c1[i])
        }
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

  const unmount: UnmountFn = (vnode) => {
    hostRemove(vnode)
  }

  const render: RootRenderFunction = (vnode, container) => {
    if (vnode) {
      patch(container?._vnode || null, vnode, container)
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
