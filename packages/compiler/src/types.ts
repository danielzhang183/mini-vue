export enum TEXTMODES {
  DATA = 'DATA',
  RCDATA = 'RCDATA',
  RAWTEXT = 'RAWTEXT',
  CDATA = 'CDATA',
}

export interface ParseContext {
  source: string
  mode: TEXTMODES
  advanceBy: (num: number) => void
  advanceSpaces: () => void
}

export interface Element {
  type: 'Element'
  tag: string
  props?: Attribute[]
  children?: Element[]
  isSelfClosing: boolean
}

export interface Attribute {
  type: 'Attribute'
  name: string
  value: unknown
}

export interface Text {
  type: 'Text'
  content: string
}
