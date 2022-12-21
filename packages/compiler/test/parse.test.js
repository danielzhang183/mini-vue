import { describe, expect, it } from 'vitest'
import { dump, parse, transform } from '../src'

const templateStr = '<div><p>Vue</p><p>Template</p></div>'
const ast = parse(templateStr)

describe('parse', () => {
  it('parse', () => {
    expect(dump(ast)).toMatchInlineSnapshot('undefined')
  })

  it('transform', () => {
    expect(transform(ast)).toMatchInlineSnapshot('undefined')
  })
})
