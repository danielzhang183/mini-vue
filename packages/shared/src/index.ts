export * from './base'
export * from './helpers'
export * from './is'
export * from './shapeFlags'
export * from './types'

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)
