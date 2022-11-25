import { describe, it } from 'vitest'
import { watch } from '../src/watch'
import { p } from './fixtures'

describe('watch', () => {
  it('watch object', () => {
    watch(p, () => console.log('watch obj changing...'))

    p.foo++
  })
})
