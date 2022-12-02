import { beforeEach, describe, expect, it } from 'vitest'
import type { TestElement } from '@mini-vue/runtime-test'
import { nodeOps, render, serializeInner } from '@mini-vue/runtime-test'
import { isString } from '@mini-vue/shared'
import { h } from '../src/h'

function toSpan(content: any) {
  if (isString(content))
    return h('span', content.toString())
  else
    return h('span', { key: content }, content.toString())
}

const inner = (c: TestElement) => serializeInner(c)

describe('renderer: children', () => {
  let root: TestElement
  let elm: TestElement
  const renderChildren = (arr: (number | string)[]) => {
    render(h('div', arr.map(toSpan)), root)
    return root.children[0] as TestElement
  }

  beforeEach(() => {
    root = nodeOps.createElement('div')
  })

  it('append', () => {
    elm = renderChildren([1])
    expect(elm.children.length).toBe(1)
    elm = renderChildren([1, 2, 3])
    expect(elm.children.length).toBe(3)
    expect((elm.children as TestElement[]).map(inner)).toEqual(
      [
        '1',
        '2',
        '3',
      ],
    )
  })

  it('prepend', () => {
    elm = renderChildren([4, 5])
    expect(elm.children.length).toBe(2)

    elm = renderChildren([1, 2, 3, 4, 5])
    expect(elm.children.length).toBe(5)
    expect((elm.children as TestElement[]).map(inner)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ])
  })

  it('patch previously empty children', () => {
    elm = renderChildren([1, 2, 3])
    expect(elm.children.length).toBe(3)
    elm = renderChildren([4, 5, 6])
    expect((elm.children as TestElement[]).map(inner)).toEqual(
      [
        '4',
        '5',
        '6',
      ],
    )
  })
})
