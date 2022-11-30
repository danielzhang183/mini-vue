export const toString = (val: any) => Object.prototype.toString.call(val)
export const hasOwnProperty = (o: any, k: PropertyKey) => Object.prototype.hasOwnProperty.call(o, k)

export const EMPTY_OBJ: { readonly [key: string]: any } = __DEV__
  ? Object.freeze({})
  : {}
export const EMPTY_ARR = __DEV__ ? Object.freeze([]) : []
