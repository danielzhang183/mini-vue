/* eslint-disable no-alert */
import { createCommentVNode, createElementVNode, createTextVNode } from '../../dist'

const textVNode = createTextVNode('Text Node here')
const commentVNode = createCommentVNode('comment Node here')
const children = [textVNode, commentVNode]
export const vnode = createElementVNode(
  'h1',
  {
    id: 'foo',
    class: 'bar baz',
    onclick: () => alert('hello'),
    oncontextmenu: () => alert('contextmenu'),
  },
  children,
)

export const container = document.querySelector('#app')
