import { isString } from '@mini-vue/shared'
import createDebug from 'debug'
import type { VNode } from './vnode'

const debug = {
  renderer: createDebug('mini-vue:renderer'),
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
  insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void
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

export const rendererOptions: RendererOptions = {
  createElement(tag) {
    debug.renderer(`create Element ${tag}`)
    return document.createElement(tag)
  },
  setElementText(el, text) {
    debug.renderer(`set ${JSON.stringify(el)} text content of ${text}`)
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    debug.renderer(`insert ${JSON.stringify(el)} under ${JSON.stringify(parent)}`)
    parent.insertBefore(el, anchor)
  },
}

export function createRenderer(options: RendererOptions) {
  const {
    createElement,
    setElementText,
    insert,
  } = options

  function mountElement(vnode: VNode, container: RendererElement) {
    const el = createElement(vnode.type as string)
    if (isString(vnode.children))
      setElementText(el, vnode.children)

    insert(el, container)
  }

  const patch: PatchFn = (n1, n2, container) => {
    if (!n1)
      mountElement(n2, container)
    else
      console.log('')
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
