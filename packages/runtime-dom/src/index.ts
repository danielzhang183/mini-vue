import { createRenderer } from '@mini-vue/runtime-core'
import type { Renderer, RootRenderFunction } from '@mini-vue/runtime-core'
import { extend } from '@mini-vue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const rendererOptions = extend({ patchProp }, nodeOps)

let renderer: Renderer<Element>

function ensureRenderer() {
  return (
    renderer || (renderer = createRenderer<Node, Element>(rendererOptions))
  )
}

export const render = ((...args) => {
  ensureRenderer().render(...args)
}) as RootRenderFunction<Element>
