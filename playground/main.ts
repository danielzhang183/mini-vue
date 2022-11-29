import type { VNode } from '../packages/runtime-core/src'
import { createRenderer, rendererOptions } from '../packages/runtime-core/src'

const vnode: VNode = {
  __v_isVNode: true,
  type: 'h1',
  children: 'hello',
}

const renderer = createRenderer(rendererOptions)
renderer.render(vnode, document.querySelector('#app'))
