import { EMPTY_ARR, EMPTY_OBJ, ShapeFlags } from '@mini-vue/shared'
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

export const enum MoveType {
  ENTER,
  LEAVE,
  REORDER,
}

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
    parentAnchor: RendererNode | null,
  ) => {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1

    // 1. sync from start
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = (c2[i] = normalizeVNode(c2[i]))
      if (isSameVNodeType(n1, n2))
        patch(n1, n2, container, null)
      else
        break
      i++
    }

    // 2. sync from end
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = (c2[e2] = normalizeVNode(c2[e2]))
      if (isSameVNodeType(n1, n2))
        patch(n1, n2, container, null)
      else
        break
      e1--
      e2--
    }

    // 3. common sequence + mount
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2
          ? (c2[nextPos] as VNode).el
          : parentAnchor
        while (i <= e2) {
          patch(
            null,
            (c2[i] = normalizeVNode(c2[i])),
            container,
            anchor,
          )
          i++
        }
      }
    }

    // 4. common sequence + unmount
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    }

    // 5. unknown sequence
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    else {
      const s1 = i
      const s2 = i

      // 5.1 build key:index map for newChildren
      const keyToNewIndexMap: Map<string | number | symbol, number> = new Map()
      for (i = s2; i <= e2; i++) {
        const nextChild = (c2[i] = normalizeVNode(c2[i]))
        if (nextChild.key != null) {
          if (keyToNewIndexMap.has(nextChild.key)) {
            console.warn(
              'Duplicate keys found during update:',
              JSON.stringify(nextChild.key),
              'Make sure keys are unique.',
            )
          }
          keyToNewIndexMap.set(nextChild.key, i)
        }
      }

      // 5.2 loop through old children left to be patched and try to patch
      // matching nodes & remove nodes that are no longer present
      let j
      let patched = 0
      const toBePatched = e2 - s2 + 1
      let moved = false
      // used to track whether any node has moved
      let maxNewIndexSoFar = 0
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (i = 0; i < toBePatched; i++)
        newIndexToOldIndexMap[i] = 0

      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        if (patched >= toBePatched) {
          // all new children have been patched so this can only be a removal
          unmount(prevChild)
          continue
        }
        let newIndex
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        }
        else {
          // TODO: patch unkeyed node
        }

        if (newIndex === undefined) {
          unmount(prevChild)
        }
        else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1

          if (newIndex >= maxNewIndexSoFar)
            maxNewIndexSoFar = newIndex
          else
            moved = true

          patch(prevChild, c2[newIndex] as VNode, container, null)
          patched++
        }
      }

      // 5.3 move and mount
      // generate longest stable subsequence only when nodes have moved
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : EMPTY_ARR
      j = increasingNewIndexSequence.length - 1
      // looping backwards so that we can use last patched node as anchor
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i
        const nextChild = c2[nextIndex] as VNode
        const anchor = nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode) : parentAnchor
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor)
        }
        else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j])
            moved(nextChild, container, anchor, MoveType.REORDER)
          else
            j--
        }
      }
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

function getSequence(arr: number[]) {
  return 1
}
