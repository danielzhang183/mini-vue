import { generate } from './generate'
import { parse } from './parse'
import { transform } from './transform'

export function compile(template) {
  const ast = parse(template)
  transform(ast)
  const code = generate(ast.jsNode)

  return code
}
