import { ShapeFlags, isArray, isString } from '@mini-vue/shared'
import type { VNode } from './vnode'
import { Text } from './vnode'

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
  setElementText(node: HostElement, text: string): void
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
    createElement: hostCreateText,
    setElementText: hostSetText,
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
      default:
        if (shapeFlag & ShapeFlags.ELEMENT)
          processElement(n1, n2, container)
    }
  }

  const processText: ProcessTextOrCommentFn = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert(
        (n2.el = hostCreateText(n2.children as string)),
        container,
      )
    }
    else {
      const el = (n2.el = n1.el!)
      if (n2.children !== n1.children)
        hostSetText(el, n2.children as string)
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
    const el = vnode.el = hostCreateText(vnode.type as string)
    const { props } = vnode

    if (isString(vnode.children))
      hostSetText(el, vnode.children as string)
    else if (isArray(vnode.children))
      // @ts-expect-error will fix
      vnode.children.forEach(child => patch(null, child, el))

    // set props
    if (props) {
      for (const key in props)
        hostPatchProp(el, key, null, props[key])
    }

    hostInsert(el, container)
  }

  const patchElement = (
    n1: VNode,
    n2: VNode,
  ) => {
    // TODO: patch element
    console.log(n1, n2)
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
