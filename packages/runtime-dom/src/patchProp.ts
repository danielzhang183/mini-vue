import type { RendererOptions } from '@mini-vue/runtime-core'
import { patchAttr } from './modules/attrs'
import { patchClass } from './modules/class'
import { patchDOMProp } from './modules/props'
import { patchStyle } from './modules/style'

type DOMRendererOptions = RendererOptions<Node, Element>

export const patchProp: DOMRendererOptions['patchProp'] = (
  el,
  key,
  prevValue,
  nextValue,
) => {
  if (key === 'class')
    patchClass(el, nextValue)

  else if (key === 'style')
    patchStyle(el, prevValue, nextValue)

  else if (shouldSetAsProps(el, key))
    patchDOMProp(el, key, nextValue)

  else
    patchAttr(el, key, nextValue)
}

function shouldSetAsProps(
  el: Element,
  key: string,
) {
  if (key === 'spellcheck' || key === 'draggable' || key === 'translate')
    return false

  if (key === 'form')
    return false

  if (key === 'list' && el.tagName === 'INPUT')
    return false

  if (key === 'type' && el.tagName === 'TEXTAREA')
    return false

  return key in el
}
