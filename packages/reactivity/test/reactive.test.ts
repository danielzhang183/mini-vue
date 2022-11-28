import { describe, expect, it } from 'vitest'
import { effect, reactive, readonly, shallowReactive } from '../src'

describe.skip('reactive', () => {
  it('deep reactive - nesting object', () => {
    const obj = reactive({ foo: { bar: 1 } })
    effect(() => console.log(obj.foo.bar))
    // expect trigger twice
    obj.foo.bar = 2
  })

  it('shallow reactive', () => {
    const obj1 = shallowReactive({ foo: { bar: 1 } })
    effect(() => console.log(obj1.foo.bar))
    // export non trigger
    obj1.foo.bar = 3
  })

  it('readonly', () => {
    const obj2 = readonly({ foo: { bar: 1 } })
    effect(() => console.log(obj2.foo))
    obj2.foo = { bar: 2 }
    expect(obj2.foo.bar).toBe(1)
    obj2.foo.bar = 3
    expect(obj2.foo.bar).toBe(1)
  })

  it('shallowReadonly', () => {
    const obj3 = shallowReactive({ foo: { bar: 1 } })
    effect(() => console.log(obj3.foo))
    obj3.foo = { bar: 2 }
    expect(obj3.foo.bar).toBe(2)
    obj3.foo.bar = 3
    expect(obj3.foo.bar).toBe(3)
  })
})

describe('Array', () => {
  it.skip('basic', () => {
    const arr = reactive(['foo'])
    effect(() => console.log(arr[0]))
    arr[0] = 'bar'
  })

  it.skip('modify array length to trigger', () => {
    const arr1 = reactive(['foo'])
    effect(() => console.log(arr1.length))
    arr1[1] = 'bar'
    expect(arr1.length).toBe(2)
    expect(arr1).toStrictEqual(['foo', 'bar'])
    arr1.length = 0
    expect(arr1.length).toBe(0)
    expect(arr1).toStrictEqual([])
  })

  it('for in', () => {
    const arr2 = reactive(['foo'])

    effect(() => {
      for (const key in arr2)
        console.log(key)
    })

    arr2[1] = 'bar'
    arr2.length = 0
  })
})
