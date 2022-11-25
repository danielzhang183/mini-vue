import { describe, expect, it } from 'vitest'
import { effect } from '../src'
import { computed } from '../src/computed'
import { p } from './fixtures'

const sum = computed(() => p.foo + p.bar)

describe('computed', () => {
  it.skip('basic', () => {
    expect(sum.value).toBe(3)
  })

  it.skip('dirty check', () => {
    p.foo++
    expect(sum.value).toBe(4)
  })

  it('nesting effect', () => {
    effect(() => console.log(sum.value))

    p.foo++
  })
})
