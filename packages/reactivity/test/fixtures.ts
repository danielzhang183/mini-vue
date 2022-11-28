import { reactive } from '../src/reactive'

export const obj = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.bar
  },
  ok: true,
}

export const p = reactive(obj)
