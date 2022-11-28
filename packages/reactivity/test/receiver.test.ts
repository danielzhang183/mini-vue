import { describe, it } from 'vitest'
import { effect } from '../src'
import { p } from './fixtures'

describe('Receiver', () => {
  it('getter field', () => {
    effect(() => console.log(p.baz))
    p.bar++
  })
})
