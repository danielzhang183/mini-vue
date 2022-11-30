export const extend = Object.assign

const hyphenateRE = /\B([A-Z])/g
export const hyphenate = (str: string) => str.replace(hyphenateRE, '-$1').toLowerCase()
