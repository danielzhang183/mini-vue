import { isArray, isString } from '@mini-vue/shared'
import type { VNode } from './vnode'

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
  createElement(type: string): HostElement
  setElementText(node: HostElement, text: string): void
  insert(el: HostElement, parent: HostElement, anchor?: HostNode | null): void
  patchProp(el: HostElement, key: string, prevValue: any, nextValue: any): void
}

type PatchFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor?: RendererNode | null,
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
    createElement,
    setElementText,
    insert,
    patchProp,
  } = options

  const patch: PatchFn = (n1, n2, container) => {
    if (!n1)
      mountElement(n2, container)
    else
      console.log('')
  }

  function mountElement(vnode: VNode, container: RendererElement) {
    const el = createElement(vnode.type as string)
    const { props } = vnode

    if (isString(vnode.children))
      setElementText(el, vnode.children as string)
    else if (isArray(vnode.children))
      // @ts-expect-error will fix
      vnode.children.forEach(child => patch(null, child, el))

    // set props
    if (props) {
      for (const key in props)
        patchProp(el, key, null, props[key])
    }

    insert(el, container)
  }

  const render: RootRenderFunction = (vnode, container) => {
    if (vnode) {
      patch(container?._vnode || null, vnode, container)
    }
    else {
      if (container._vnode)
        container.innerHTML = ''
    }
    container._vnode = vnode
  }

  return {
    render,
  }
}
