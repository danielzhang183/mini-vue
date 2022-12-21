import { dump } from './utils'

export function transform(ast) {
  const context = {
    nodeTransforms: [
      transfromElement,
      transformText,
    ],
  }
  traverseNode(ast, context)
  console.log(dump(ast))
}

function traverseNode(ast, context) {
  const currentNode = ast

  const transforms = context.nodeTransforms

  for (let i = 0; i < transforms.length; i++)
    transforms[i](currentNode, context)

  const { children } = currentNode
  if (!children)
    return

  for (let i = 0; i < children.length; i++)
    traverseNode(children[i], context)
}

function transfromElement(node) {
  if (node.type === 'Element' && node.tag === 'p')
    node.tag = 'h1'
}

function transformText(node) {
  if (node.type === 'Text')
    node.content = node.content.repeat(2)
}
