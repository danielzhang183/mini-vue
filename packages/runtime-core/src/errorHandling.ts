import type { ComponentInternalInstance, LifecycleHooks } from './component'
import type { VNode } from './vnode'

export const enum ErrorCodes {
  SETUP_FUNCTION,
  RENDER_FUNCTION,
  WATCH_GETTER,
  WATCH_CALLBACK,
  WATCH_CLEANUP,
  NATIVE_EVENT_HANDLER,
  COMPONENT_EVENT_HANDLER,
  VNODE_HOOK,
  DIRECTIVE_HOOK,
  TRANSITION_HOOK,
  APP_ERROR_HANDLER,
  APP_WARN_HANDLER,
  FUNCTION_REF,
  ASYNC_COMPONENT_LOADER,
  SCHEDULER,
}

export type ErrorTypes = LifecycleHooks | ErrorCodes

export function callWithErrorHandling(
  fn: Function,
  instance: ComponentInternalInstance | null,
  type: ErrorTypes,
  args: unknown[],
) {
  let res

  try {
    res = args ? fn(...args) : fn()
  }
  catch (error) {
    handleError(error, instance, type)
  }
  return res
}

export function handleError(
  err: unknown,
  instance: ComponentInternalInstance | null,
  type: ErrorTypes,
  throwInDev = true,
) {
  const contextVNode = instance ? instance.vnode : null
  logError(err, type, contextVNode, throwInDev)
}

function logError(
  err: unknown,
  type: ErrorTypes,
  contextVNode: VNode | null,
  throwInDev = true,
) {
  if (throwInDev)
    throw err
  else
    console.error(err)
}
