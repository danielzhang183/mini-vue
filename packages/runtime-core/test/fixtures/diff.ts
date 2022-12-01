import { createElementVNode } from '../../src'

export const oldVNode = createElementVNode(
  'div',
  null,
  [
    createElementVNode('p', null, '1'),
    createElementVNode('p', null, '2'),
    createElementVNode('p', null, '3'),
  ],
)

export const newVNode = createElementVNode(
  'div',
  null,
  [
    createElementVNode('p', null, '4'),
    createElementVNode('p', null, '5'),
    createElementVNode('p', null, '6'),
  ],
)
