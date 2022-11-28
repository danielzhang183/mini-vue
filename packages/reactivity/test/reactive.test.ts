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

  it.skip('for...in', () => {
    const arr2 = reactive(['foo'])

    effect(() => {
      for (const key in arr2)
        console.log(key)
    })

    arr2[1] = 'bar'
    arr2.length = 0
  })

  it.skip('for...of', () => {
    const arr3 = reactive(['foo'])

    effect(() => {
      for (const key of arr3.values())
        console.log(key)
    })

    arr3[1] = 'bar'
    arr3.length = 0
  })

  it('includes', () => {
    // const arr4 = reactive([1, 2])
    // effect(() => console.log(arr4.includes(1)))

    // arr4[0] = 3

    const obj = {}
    const arr5 = reactive([obj])
    expect(arr5.includes(arr5[0])).toBe(true)
    expect(arr5.includes(obj)).toBe(true)
  })

  it('push', () => {
    const arr = reactive([])
    effect(() => arr.push(1))
    effect(() => arr.push(2))
    expect(arr).toStrictEqual([1, 2])
  })
})
