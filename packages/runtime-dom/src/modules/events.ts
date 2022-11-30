import { hyphenate, isArray } from '@mini-vue/shared'

type EventValue = Function | Function[]

interface Invoker extends EventListener {
  value: EventValue
  attached: number
}

export function patchEvent(
  el: Element & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  prevValue: EventValue | null,
  nextValue: EventValue | null,
) {
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[rawName]
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue
  }
  else {
    const [name, options] = parseName(rawName)
    if (nextValue) {
      const invoker = (invokers[rawName] = createInvoker(nextValue))
      addEventListener(el, name, invoker, options)
    }
    else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options)
      invokers[rawName] = undefined
    }
  }
}

function createInvoker(initialValue: EventValue) {
  const invoker: Invoker = (e: Event) => {
    // const fns = patchStopImmediatePropagation(e, invoker.value)
    // console.log({ fns })
    // isArray(fns) ? fns.forEach(fn => fn(e)) : fns(e)
    if (e.timeStamp < invoker.attached)
      return
    if (isArray(invoker.value))
      invoker.value.forEach(fn => fn(e))
    else
      invoker.value(e)
  }
  invoker.value = initialValue
  invoker.attached = performance.now()
  return invoker
}

export function patchStopImmediatePropagation(
  e: Event,
  value: EventValue,
): EventValue {
  if (isArray(value)) {
    const originalStop = e.stopImmediatePropagation
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      (e as any)._stopped = true
    }
    return value.map(fn => (e: Event) => !(e as any)._stopped && fn && fn(e))
  }
  else {
    return value
  }
}

const optionsModifierRE = /(?:Once|Passive|Capture)$/
function parseName(name: string): [string, EventListenerOptions | undefined] {
  let options: EventListenerOptions | undefined
  if (optionsModifierRE.test(name)) {
    options = {}
    let m
    // eslint-disable-next-line no-cond-assign
    while ((m = name.match(optionsModifierRE))) {
      name = name.slice(0, name.length - m[0].length);
      (options as any)[m[0].toLowerCase()] = true
    }
  }
  const event = name[2] === ':' ? name.slice(3) : hyphenate(name.slice(2))
  return [event, options]
}

export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions,
) {
  el.addEventListener(event, handler, options)
}

export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions,
) {
  el.removeEventListener(event, handler, options)
}
