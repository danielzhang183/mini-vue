import { toString } from './base'

export const isDef = <T = any>(val?: T): val is T => typeof val !== 'undefined'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'
export const isObject = (val: unknown): val is object => toString(val) === '[object Object]'
export const isFunction = <T extends Function>(val: unknown): val is T => typeof val === 'function'
export const isArray = Array.isArray
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
