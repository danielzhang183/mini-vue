import type { RendererOptions } from '@mini-vue/runtime-core'
// import createDebug from 'debug'

// const debug = {
//   renderer: createDebug('mini-vue:renderer'),
// }

const doc = (typeof document !== 'undefined' ? document : null) as Document

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {
  insert(el, parent, anchor = null) {
    // debug.renderer(`insert ${JSON.stringify(el)} under ${JSON.stringify(parent)}`)
    parent.insertBefore(el, anchor)
  },
  remove(child) {
    const parent = child.parentNode
    if (parent)
      parent.removeChild(child)
  },
  createElement(tag) {
    // debug.renderer(`create Element ${tag}`)
    return doc.createElement(tag)
  },
  setElementText(el, text) {
    // debug.renderer(`set ${JSON.stringify(el)} text content of ${text}`)
    el.textContent = text
  },
  createText(text) {
    return doc.createTextNode(text)
  },
  setText(node, text) {
    node.nodeValue = text
  },
  createComment(text) {
    return doc.createComment(text)
  },
  parentNode: node => node.parentNode as Element | null,
  nextSibling: node => node.nextSibling,
  querySelector: selector => doc.querySelector(selector),
}
