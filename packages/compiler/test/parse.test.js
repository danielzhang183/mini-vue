import { describe, expect, it } from 'vitest'
import { dump, generate, parse, transform } from '../src'

const templateStr = '<div><p>Vue</p><p>Template</p></div>'
let ast
describe('parse', () => {
  it('parse', () => {
    ast = parse(templateStr)
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "content": "Vue",
                    "type": "Text",
                  },
                ],
                "tag": "p",
                "type": "Element",
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "type": "Text",
                  },
                ],
                "tag": "p",
                "type": "Element",
              },
            ],
            "tag": "div",
            "type": "Element",
          },
        ],
        "type": "Root",
      }
    `)
  })

  it('transform', () => {
    transform(ast)
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "content": "Vue",
                    "jsNode": {
                      "type": "StringLiteral",
                      "value": "Vue",
                    },
                    "type": "Text",
                  },
                ],
                "jsNode": {
                  "arguments": [
                    {
                      "type": "StringLiteral",
                      "value": "p",
                    },
                    {
                      "type": "StringLiteral",
                      "value": "Vue",
                    },
                  ],
                  "callee": {
                    "name": "h",
                    "type": "Identifier",
                  },
                  "type": "CallExpression",
                },
                "tag": "p",
                "type": "Element",
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "jsNode": {
                      "type": "StringLiteral",
                      "value": "Template",
                    },
                    "type": "Text",
                  },
                ],
                "jsNode": {
                  "arguments": [
                    {
                      "type": "StringLiteral",
                      "value": "p",
                    },
                    {
                      "type": "StringLiteral",
                      "value": "Template",
                    },
                  ],
                  "callee": {
                    "name": "h",
                    "type": "Identifier",
                  },
                  "type": "CallExpression",
                },
                "tag": "p",
                "type": "Element",
              },
            ],
            "jsNode": {
              "arguments": [
                {
                  "type": "StringLiteral",
                  "value": "div",
                },
                {
                  "elements": [
                    {
                      "arguments": [
                        {
                          "type": "StringLiteral",
                          "value": "p",
                        },
                        {
                          "type": "StringLiteral",
                          "value": "Vue",
                        },
                      ],
                      "callee": {
                        "name": "h",
                        "type": "Identifier",
                      },
                      "type": "CallExpression",
                    },
                    {
                      "arguments": [
                        {
                          "type": "StringLiteral",
                          "value": "p",
                        },
                        {
                          "type": "StringLiteral",
                          "value": "Template",
                        },
                      ],
                      "callee": {
                        "name": "h",
                        "type": "Identifier",
                      },
                      "type": "CallExpression",
                    },
                  ],
                  "type": "ArrayExpression",
                },
              ],
              "callee": {
                "name": "h",
                "type": "Identifier",
              },
              "type": "CallExpression",
            },
            "tag": "div",
            "type": "Element",
          },
        ],
        "jsNode": {
          "body": [
            {
              "return": {
                "arguments": [
                  {
                    "type": "StringLiteral",
                    "value": "div",
                  },
                  {
                    "elements": [
                      {
                        "arguments": [
                          {
                            "type": "StringLiteral",
                            "value": "p",
                          },
                          {
                            "type": "StringLiteral",
                            "value": "Vue",
                          },
                        ],
                        "callee": {
                          "name": "h",
                          "type": "Identifier",
                        },
                        "type": "CallExpression",
                      },
                      {
                        "arguments": [
                          {
                            "type": "StringLiteral",
                            "value": "p",
                          },
                          {
                            "type": "StringLiteral",
                            "value": "Template",
                          },
                        ],
                        "callee": {
                          "name": "h",
                          "type": "Identifier",
                        },
                        "type": "CallExpression",
                      },
                    ],
                    "type": "ArrayExpression",
                  },
                ],
                "callee": {
                  "name": "h",
                  "type": "Identifier",
                },
                "type": "CallExpression",
              },
              "type": "ReturnStatement",
            },
          ],
          "id": {
            "name": "render",
            "type": "Identifier",
          },
          "params": [],
          "type": "FunctionDecl",
        },
        "type": "Root",
      }
    `)
  })

  it('generate code', () => {
    const code = generate(ast.jsNode)
    expect(code).toMatchInlineSnapshot(`
      "function render () {
        return h('div', [h('p', 'Vue'), h('p', 'Template')])
      }"
    `)
  })
})
