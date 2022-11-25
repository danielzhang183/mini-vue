export const isObject = (val: unknown): val is Object => typeof val === 'object'
export const isDef = (val: unknown) => val != null
