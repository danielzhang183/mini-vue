import { isBoolean } from '@mini-vue/shared'

export function patchDOMProp(
  el: any,
  key: string,
  value: any,
) {
  if (isBoolean(el[key]) && value === '')
    el[key] = true
  else
    el[key] = value
}
