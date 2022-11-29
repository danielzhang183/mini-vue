export * from './base'
export * from './is'
export * from './types'
export * from './helpers'

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)
