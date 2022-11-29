import { isArray, isBoolean, isString } from '@mini-vue/shared'
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
  patchProps(el: HostNode, key: string, prevValue: any, nextValue: any): void
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
  patchProps(el, key, prevValue, nextValue) {
    if (shouldSetAsProps(el, key)) {
      if (isBoolean(el[key]) && nextValue === '')
        el[key] = true
      else
        el[key] = nextValue
    }
    else {
      el.setAttribute(key, nextValue)
    }
  },
}

function shouldSetAsProps(el: RendererElement, key: string) {
  if (key === 'form' && el.tagName === 'INPUT')
    return false
  return key in el
}

export function createRenderer(options: RendererOptions) {
  const {
    createElement,
    setElementText,
    insert,
    patchProps,
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
      vnode.children.forEach(child => patch(null, child, el))

    // set props
    if (props) {
      for (const key in props)
        patchProps(el, key, null, props[key])
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
