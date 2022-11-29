import type { VNode } from '../packages/runtime-core/src'
import { createRenderer, rendererOptions } from '../packages/runtime-core/src'

const vnode: VNode = {
  __v_isVNode: true,
  type: 'h1',
  props: {
    id: 'foo',
  },
  children: [
    {
      __v_isVNode: true,
      type: 'p',
      children: 'hello',
      props: null,
    },
  ],
}

const renderer = createRenderer(rendererOptions)
renderer.render(vnode, document.querySelector('#app'))
