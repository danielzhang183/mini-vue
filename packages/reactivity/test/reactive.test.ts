import { describe, it } from 'vitest'
import { effect, reactive, shallowReactive } from '../src'

describe('reactive', () => {
  it.skip('deep reactive - nesting object', () => {
    const obj = reactive({ foo: { bar: 1 } })
    effect(() => console.log(obj.foo.bar))
    obj.foo.bar = 2
  })

  it('shallow reactive', () => {
    const obj1 = shallowReactive({ foo: { bar: 1 } })
    effect(() => console.log(obj1.foo.bar))
    obj1.foo.bar = 3
  })
})
