import type {
  // CreateAppFunction,
  RootRenderFunction,
  VNode,
} from '@mini-vue/runtime-core'
import {
  createRenderer,
} from '@mini-vue/runtime-core'
import { extend } from '@mini-vue/shared'
import type { TestElement } from './nodeOps'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
import { serializeInner } from './serialize'

const {
  render: baseRender,
  // createApp: baseCreateApp
} = createRenderer(
  extend({ patchProp }, nodeOps),
)

export const render = baseRender as RootRenderFunction<TestElement>
// export const createApp = baseCreateApp as CreateAppFunction<TestElement>

// convenience for one-off render validations
export function renderToString(vnode: VNode) {
  const root = nodeOps.createElement('div')
  render(vnode, root)
  return serializeInner(root)
}

export * from './triggerEvent'
export * from './serialize'
export * from './nodeOps'
export * from '@mini-vue/runtime-core'
