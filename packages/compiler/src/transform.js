import { createArrayExpression, createCallExpression, createStringLiteral } from './helpers'
import { dump } from './utils'

export function transform(ast) {
  const context = {
    currentNode: null,
    childIndex: 0,
    parent: null,
    replaceNode(node) {
      context.currentNode = node
      context.parent.children[context.childIndex] = node
    },
    removeNode() {
      if (context.parent) {
        context.parent.children.splice(context.childIndex, 1)
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformRoot,
      transfromElement,
      transformText,
    ],
  }
  traverseNode(ast, context)
  console.log(dump(ast))
}

function traverseNode(ast, context) {
  context.currentNode = ast

  const exitFns = []
  const transforms = context.nodeTransforms

  for (let i = 0; i < transforms.length; i++) {
    const onExit = transforms[i](context.currentNode, context)

    if (onExit)
      exitFns.push(onExit)
    if (!context.currentNode)
      return
  }

  const { children } = context.currentNode
  if (!children)
    return

  for (let i = 0; i < children.length; i++) {
    context.parent = context.currentNode
    context.childIndex = i
    traverseNode(children[i], context)
  }

  let i = exitFns.length
  while (i--)
    exitFns[i]()
}

function transfromElement(node) {
  return () => {
    if (node.type !== 'Element')
      return

    const callExp = createCallExpression('h', [
      createStringLiteral(node.tag),
    ])

    node.children.length === 1
      ? callExp.arguments.push(node.children[0].jsNode)
      : callExp.arguments.push(createArrayExpression(node.children.map(c => c.jsNode)))
    node.jsNode = callExp
  }
}

function transformText(node) {
  if (node.type !== 'Text')
    return

  node.jsNode = createStringLiteral(node.content)
}

function transformRoot(node) {
  return () => {
    if (node.type !== 'Root')
      return
    const vnodeJSAST = node.children[0].jsNode
    node.jsNode = {
      type: 'FunctionDecl',
      id: { type: 'Identifier', name: 'render' },
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnodeJSAST,
        },
      ],
    }
  }
}
