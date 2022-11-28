import { createReactive } from '../src/reactive'

export const obj = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.bar
  },
  a: { b: 1 },
  ok: true,
}

export const p = createReactive(obj)
