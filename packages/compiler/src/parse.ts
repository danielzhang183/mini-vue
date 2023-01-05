import { parseAttributes } from './parseAttributes'
import type { ParseContext, Text } from './types'
import { TEXTMODES } from './types'

export function parse(str: string) {
  const context: ParseContext = {
    source: str,
    mode: TEXTMODES.DATA,
    advanceBy(num) {
      context.source = context.source.slice(num)
    },
    advanceSpaces() {
      const match = /^[\t\r\n\f]/.exec(context.source)
      if (match)
        context.advanceBy(match[0].length)
    },
  }

  const nodes = parseChildren(context, [])
  return {
    type: 'Root',
    children: nodes,
  }
}

function parseChildren(context: ParseContext, ancestors: Element[]) {
  const nodes = []
  const { source, mode } = context

  while (!isEnd(context, ancestors)) {
    let node

    if (mode === TEXTMODES.DATA || mode === TEXTMODES.RCDATA) {
      if (mode === TEXTMODES.DATA && source[0] === '<') {
        if (source[1] === '!') {
          if (source.startsWith('<!--'))
            node = parseComment(context)
          else if (source.startsWith('<![CDATA['))
            node = parseCDATA(context, ancestors)
        }
        else if (source[1] === '/') {
          console.error('Invalid end tag')
        }
        else if (/[a-z]/i.test(source[1])) {
          node = parseElement(context, ancestors)
        }
      }
      else if (source.startsWith('{{')) {
        node = parseInterpolation(context)
      }
    }

    if (!node)
      node = parseText(context)

    nodes.push(node)
  }

  return nodes
}

function parseTag(context: ParseContext, type = 'start') {
  const { advanceBy, advanceSpaces, source } = context

  const match = type === 'start'
    ? /^<([a-z][^\t\r\n\f />]*)/i.exec(source)
    : /^<\/([a-z][^\t\r\n\f />]*)/i.exec(source)

  const tag = match?.[1]
  advanceBy(match![0].length)
  advanceSpaces()

  const props = parseAttributes(context)

  const isSelfClosing = source.startsWith('/>')
  advanceBy(isSelfClosing ? 2 : 1)

  return {
    type: 'Element',
    tag,
    props,
    children: [],
    isSelfClosing,
  }
}

function isEnd(context: ParseContext, ancestors: Element[]) {
  if (!context.source)
    return true

  for (let i = ancestors.length - 1; i >= 0; --i) {
    if (context.source.startsWith(`</${ancestors[i].tag}`))
      return true
  }
}

function parseElement(context: ParseContext, ancestors: Element[]) {
  const element = parseTag(context)
  if (element.isSelfClosing)
    return element

  if (element.tag === 'textarea' || element.tag === 'title')
    context.mode = TEXTMODES.RCDATA
  else if (/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag!))
    context.mode = TEXTMODES.RAWTEXT
  else
    context.mode = TEXTMODES.DATA

  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (context.source.startsWith(`</${element.tag}`))
    parseTag(context, 'end')
  else
    console.error(`${element.tag} lack of end tag`)

  return element
}

function parseText(context: ParseContext): Text {
  const { source } = context
  let endIndex = source.length

  const ltIndex = source.indexOf('<')
  const delimiterIndex = source.indexOf('{{')

  if (ltIndex > -1 && ltIndex < endIndex)
    endIndex = ltIndex

  if (delimiterIndex > -1 && delimiterIndex < endIndex)
    endIndex = delimiterIndex

  const content = source.slice(0, endIndex)
  context.advanceBy(content.length)

  return {
    type: 'Text',
    content,
  }
}
