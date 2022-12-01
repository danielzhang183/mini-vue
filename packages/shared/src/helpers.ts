export const extend = Object.assign

const hyphenateRE = /\B([A-Z])/g
export const hyphenate = (str: string) => str.replace(hyphenateRE, '-$1').toLowerCase()

export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value,
  })
}
