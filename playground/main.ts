import type { VNode } from '../packages/runtime-core/src'
import { render } from '../packages/runtime-dom/src'

const vnode: VNode = {
  __v_isVNode: true,
  type: 'h1',
  props: {
    id: 'foo',
    class: 'bar baz',
  },
  el: null,
  children: [
    {
      __v_isVNode: true,
      type: 'p',
      children: 'hello',
      props: null,
      el: null,
    },
  ],
}

const container = document.querySelector('#app')
render(vnode, container)
render(null, container)
