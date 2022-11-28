import { describe, it } from 'vitest'
import { effect } from '../src/effect'
import { flushJob, queue } from '../src/flush'
import { p } from './fixtures'

describe('effect', () => {
  it.skip('only collect relative effect', () => {
    effect(() => {
      const text = p.ok ? p.foo : 'not'
      console.log(text)
    })
    p.ok = false
    p.foo = 2
  })

  it.skip('nesting effect', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let t1, t2
    effect(() => {
      console.log('outer executing...')

      effect(() => {
        console.log('inner executing...')
        t2 = p.bar
      })

      t1 = p.foo
    })
    p.foo = 3
    p.bar = 4
  })

  it.skip('avoid triggering effect unlimitly', () => {
    effect(() => p.foo++)
  })

  it.skip('support scheduler options', () => {
    effect(
      () => {
        console.log(p.foo)
      },
      {
        scheduler(fn) {
          setTimeout(fn, 0)
        },
      },
    )

    p.foo++
    console.log('executing end...')
  })

  it.skip('trigger effect', () => {
    effect(
      () => console.log(p.foo),
      {
        scheduler(fn) {
          queue.add(fn)
          flushJob()
        },
      },
    )
    p.foo++
    p.foo++
  })

  it('iterate key of object', () => {
    effect(() => {
      for (const key in p)
        console.log(key)
    })
    p.new = 2
    console.log('=========')
    for (const key in p)
      console.log(key)
  })
})
