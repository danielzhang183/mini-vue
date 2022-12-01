import { describe, expect, it } from 'vitest'
import { createVNode } from '../src/vnode'
import { h } from '../src/h'

describe('h', () => {
  it('only type', () => {
    expect(h('div')).toMatchObject(createVNode('div'))
  })

  it('type + props', () => {
    expect(h('div', { id: 'foo' })).toMatchObject(createVNode('div', { id: 'foo' }))
  })

  it('type + props + chlidren', () => {
    // array
    expect(h('div', {}, ['foo'])).toMatchObject(createVNode('div', {}, ['foo']))
    // text
    expect(h('div', {}, 'foo')).toMatchObject(createVNode('div', {}, 'foo'))
    // single vnode
    const vnode = h('div')
    expect(h('div', {}, vnode)).toMatchObject(createVNode('div', {}, [vnode]))
  })
})
