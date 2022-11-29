import type { RendererOptions } from '@mini-vue/runtime-core'
import createDebug from 'debug'

const debug = {
  renderer: createDebug('mini-vue:renderer'),
}

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {
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
