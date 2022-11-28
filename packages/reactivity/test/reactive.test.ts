import { describe, expect, it } from 'vitest'
import { effect, reactive, readonly, shallowReactive } from '../src'

describe('reactive', () => {
  it.skip('deep reactive - nesting object', () => {
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
