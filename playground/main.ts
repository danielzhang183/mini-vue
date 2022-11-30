/* eslint-disable no-alert */
import { createCommentVNode, createElementVnode, createTextVNode } from '../packages/runtime-core'
import { render } from '../packages/runtime-dom'

const textVNode = createTextVNode('Text Node here')
const commentVNode = createCommentVNode('comment Node here')
const vnode = createElementVnode(
  'h1',
  {
    id: 'foo',
    class: 'bar baz',
    onclick: () => alert('hello'),
    oncontextmenu: () => alert('contextmenu'),
  },
  [
    textVNode,
    commentVNode,
  ],
)
console.log(vnode)

const container = document.querySelector('#app')
render(vnode, container)
// render(null, container)
