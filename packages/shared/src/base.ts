export const toString = (val: any) => Object.prototype.toString.call(val)
export const hasOwnProperty = (o: any, k: PropertyKey) => Object.prototype.hasOwnProperty.call(o, k)

export const EMPTY_OBJ: { readonly [key: string]: any } = Object.freeze({})
// __DEV__
//   ? Object.freeze({})
//   : {}
export const EMPTY_ARR = Object.freeze([])
// __DEV__ ? Object.freeze([]) : []
