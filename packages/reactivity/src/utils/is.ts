import { toString } from './base'

export const isDef = <T = any>(val?: T): val is T => typeof val !== 'undefined'
export const isObject = (val: unknown): val is object => toString(val) === '[object Object]'
export const isFunction = <T extends Function>(val: any): val is T => typeof val === 'function'
