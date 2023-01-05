import type { Attribute, ParseContext } from './types'

const isQuoted = (value: string): boolean => ['"', '\''].includes(value)

export function parseAttributes(context: ParseContext): Attribute[] {
  const { source, advanceBy, advanceSpaces } = context
  const props: Attribute[] = []

  while (!source.startsWith('>') && !source.startsWith('/>')) {
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(source)
    const name = match![0]
    // consume name
    advanceBy(name.length)
    // consume spaces
    advanceSpaces()
    // consume '='
    advanceBy(1)
    // consume spaces between = and attr
    advanceSpaces()

    let value = ''
    const quote = source[0]

    if (isQuoted(quote)) {
      // consume left quote
      advanceBy(1)
      const endQuoteIndex = source.indexOf(quote)
      if (endQuoteIndex) {
        value = source.slice(0, endQuoteIndex)
        // consume attr
        advanceBy(value.length)
        // consume right quote
        advanceBy(1)
      }
      else {
        console.error('Lack of quote')
      }
    }
    else {
      // attr has no surrowed by quote, eg. id=abc
      const match = /^[^\t\r\n\f >]+/.exec(source)
      value = match![0]
      advanceBy(value.length)
    }

    advanceSpaces()
    props.push({
      type: 'Attribute',
      name,
      value,
    })
  }

  return props
}

